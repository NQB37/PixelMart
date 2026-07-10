import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app";
import { prisma } from "@/libs/prisma";
import { ROLE } from "@/generated/prisma/client";

describe("User Management Integration Tests", () => {
  const testPassword = "Password123!";

  const cleanupUser = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.delete({ where: { id: user.id } });
    }
  };

  const registerUser = async (email: string) => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email, password: testPassword });
    return res.body.data.user.id as string;
  };

  const makeAdmin = async (userId: string) => {
    const adminRole = await prisma.role.upsert({
      where: { name: ROLE.ADMIN },
      update: {},
      create: { name: ROLE.ADMIN },
    });
    await prisma.userRoles.create({ data: { userId, roleId: adminRole.id } });
  };

  const loginAs = async (email: string) => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: testPassword });
    return res.body.data.accessToken as string;
  };

  it("rejects listing users for a non-admin", async () => {
    const email = `test-user-guard-${Date.now()}@example.com`;
    await cleanupUser(email);

    try {
      await registerUser(email);
      const token = await loginAs(email);

      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    } finally {
      await cleanupUser(email);
    }
  });

  it("lists users and toggles active status for an admin", async () => {
    const adminEmail = `test-user-admin-${Date.now()}@example.com`;
    const targetEmail = `test-user-target-${Date.now()}@example.com`;
    await cleanupUser(adminEmail);
    await cleanupUser(targetEmail);

    try {
      const adminId = await registerUser(adminEmail);
      await makeAdmin(adminId);
      const adminToken = await loginAs(adminEmail);

      const targetId = await registerUser(targetEmail);

      const listRes = await request(app)
        .get("/api/v1/users")
        .query({ search: targetEmail })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.users).toHaveLength(1);
      expect(listRes.body.data.users[0].email).toBe(targetEmail);
      expect(listRes.body.data.meta.total).toBe(1);

      const statusRes = await request(app)
        .patch(`/api/v1/users/${targetId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.data.isActive).toBe(false);

      const selfRes = await request(app)
        .patch(`/api/v1/users/${adminId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(selfRes.status).toBe(400);
    } finally {
      await cleanupUser(adminEmail);
      await cleanupUser(targetEmail);
    }
  });

  it("soft deletes, restores, and permanently deletes a user for an admin", async () => {
    const adminEmail = `test-user-admin-del-${Date.now()}@example.com`;
    const targetEmail = `test-user-target-del-${Date.now()}@example.com`;
    await cleanupUser(adminEmail);
    await cleanupUser(targetEmail);

    try {
      const adminId = await registerUser(adminEmail);
      await makeAdmin(adminId);
      const adminToken = await loginAs(adminEmail);

      const targetId = await registerUser(targetEmail);

      const selfDeleteRes = await request(app)
        .delete(`/api/v1/users/${adminId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(selfDeleteRes.status).toBe(400);

      const permanentBeforeSoftDeleteRes = await request(app)
        .delete(`/api/v1/users/${targetId}/permanent`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(permanentBeforeSoftDeleteRes.status).toBe(400);

      const deleteRes = await request(app)
        .delete(`/api/v1/users/${targetId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.isActive).toBe(false);
      expect(deleteRes.body.data.deletedAt).not.toBeNull();

      const deletedListRes = await request(app)
        .get("/api/v1/users")
        .query({ search: targetEmail })
        .set("Authorization", `Bearer ${adminToken}`);
      expect(deletedListRes.body.data.users).toHaveLength(0);

      const deletedFilterRes = await request(app)
        .get("/api/v1/users")
        .query({ search: targetEmail, isDeleted: "true" })
        .set("Authorization", `Bearer ${adminToken}`);
      expect(deletedFilterRes.body.data.users).toHaveLength(1);

      const restoreRes = await request(app)
        .patch(`/api/v1/users/${targetId}/restore`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.data.isActive).toBe(true);
      expect(restoreRes.body.data.deletedAt).toBeNull();

      await request(app)
        .delete(`/api/v1/users/${targetId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      const permanentRes = await request(app)
        .delete(`/api/v1/users/${targetId}/permanent`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(permanentRes.status).toBe(204);

      const afterPermanentDelete = await prisma.user.findUnique({ where: { id: targetId } });
      expect(afterPermanentDelete).toBeNull();
    } finally {
      await cleanupUser(adminEmail);
      await cleanupUser(targetEmail);
    }
  });
});

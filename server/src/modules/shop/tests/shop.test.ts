import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app";
import { prisma } from "@/libs/prisma";
import { ROLE } from "@/generated/prisma/client";

describe("Shop Registration Integration Tests", () => {
  const cleanupUser = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.shop.deleteMany({ where: { ownerId: user.id } });
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  };

  const testPassword = "Password123!";

  const validShopPayload = {
    shopName: "Pixel Store",
    recipientName: "Nguyen Van A",
    phone: "0912345678",
    street: "123 Le Loi Street",
    ward: "Ward 1",
    province: "Ho Chi Minh City",
    nationalId: "123456789012",
    idFrontUrl: "https://example.com/id-front.jpg",
    idBackUrl: "https://example.com/id-back.jpg",
    bankAccountNumber: "1234567890",
    cardHolderName: "NGUYEN VAN A",
    cardExpiry: "12/28",
  };

  const registerUser = async (email: string) => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email, password: testPassword });
    return res.body.data.accessToken as string;
  };

  it("registers a shop for an authenticated CUSTOMER as PENDING without granting SELLER yet", async () => {
    const email = `test-shop-${Date.now()}@example.com`;
    await cleanupUser(email);

    try {
      const accessToken = await registerUser(email);

      const res = await request(app)
        .post("/api/v1/shops")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(validShopPayload);

      expect(res.status).toBe(201);
      expect(res.body.data.shopName).toBe("Pixel Store");
      expect(res.body.data.approvalStatus).toBe("PENDING");

      const me = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(me.body.data.roles).toEqual(["CUSTOMER"]);
    } finally {
      await cleanupUser(email);
    }
  });

  it("rejects a second shop registration for the same owner", async () => {
    const email = `test-shop-dup-${Date.now()}@example.com`;
    await cleanupUser(email);

    try {
      const accessToken = await registerUser(email);

      await request(app)
        .post("/api/v1/shops")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(validShopPayload);

      const res = await request(app)
        .post("/api/v1/shops")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...validShopPayload, shopName: "Another Store" });

      expect(res.status).toBe(409);
    } finally {
      await cleanupUser(email);
    }
  });

  it("rejects shop registration without authentication", async () => {
    const res = await request(app)
      .post("/api/v1/shops")
      .send({ shopName: "Pixel Store" });

    expect(res.status).toBe(401);
  });
});

describe("Admin Shop Management Integration Tests", () => {
  const testPassword = "Password123!";

  const cleanup = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.shop.deleteMany({ where: { ownerId: user.id } });
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  };

  const register = async (email: string) => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email, password: testPassword });
    return res.body.data.user.id as string;
  };

  const login = async (email: string) => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: testPassword });
    return res.body.data.accessToken as string;
  };

  const makeAdmin = async (userId: string) => {
    const adminRole = await prisma.role.upsert({
      where: { name: ROLE.ADMIN },
      update: {},
      create: { name: ROLE.ADMIN },
    });
    await prisma.roles.create({ data: { userId, roleId: adminRole.id } });
  };

  const shopPayload = (shopName: string) => ({
    shopName,
    recipientName: "Nguyen Van A",
    phone: "0912345678",
    street: "123 Le Loi Street",
    ward: "Ward 1",
    province: "Ho Chi Minh City",
    nationalId: "123456789012",
    idFrontUrl: "https://example.com/id-front.jpg",
    idBackUrl: "https://example.com/id-back.jpg",
    bankAccountNumber: "1234567890",
    cardHolderName: "NGUYEN VAN A",
    cardExpiry: "12/28",
  });

  it("rejects listing shops for a non-admin", async () => {
    const email = `test-shop-guard-${Date.now()}@example.com`;
    await cleanup(email);

    try {
      await register(email);
      const token = await login(email);

      const res = await request(app)
        .get("/api/v1/shops")
        .query({ approvalStatus: "PENDING" })
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    } finally {
      await cleanup(email);
    }
  });

  // Many real-DB round trips in one test (create, 2x /me, list, detail,
  // approve, list, reapprove) — past the default 5s timeout.
  it("lists a pending shop, shows its verification detail, and approves it", async () => {
    const adminEmail = `test-shop-admin-${Date.now()}@example.com`;
    const sellerEmail = `test-shop-seller-${Date.now()}@example.com`;
    await cleanup(adminEmail);
    await cleanup(sellerEmail);

    try {
      const adminId = await register(adminEmail);
      await makeAdmin(adminId);
      const adminToken = await login(adminEmail);

      await register(sellerEmail);
      const sellerToken = await login(sellerEmail);

      const createRes = await request(app)
        .post("/api/v1/shops")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(shopPayload("Pending Store"));
      const shopId = createRes.body.data.id as string;

      const meBeforeApproval = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${sellerToken}`);
      expect(meBeforeApproval.body.data.roles).toEqual(["CUSTOMER"]);

      const pendingList = await request(app)
        .get("/api/v1/shops")
        .query({ approvalStatus: "PENDING", search: "Pending Store" })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(pendingList.status).toBe(200);
      expect(pendingList.body.data.shops).toHaveLength(1);
      expect(pendingList.body.data.shops[0].id).toBe(shopId);

      const detailRes = await request(app)
        .get(`/api/v1/shops/${shopId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.data.verification.nationalId).toBe("123456789012");

      const approveRes = await request(app)
        .patch(`/api/v1/shops/${shopId}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(approveRes.status).toBe(200);
      expect(approveRes.body.data.approvalStatus).toBe("APPROVED");

      const meAfterApproval = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${sellerToken}`);
      expect(meAfterApproval.body.data.roles).toEqual(
        expect.arrayContaining(["CUSTOMER", "SELLER"]),
      );

      const approvedList = await request(app)
        .get("/api/v1/shops")
        .query({ approvalStatus: "APPROVED", search: "Pending Store" })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(approvedList.body.data.shops).toHaveLength(1);

      const reapproveRes = await request(app)
        .patch(`/api/v1/shops/${shopId}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(reapproveRes.status).toBe(400);
    } finally {
      await cleanup(adminEmail);
      await cleanup(sellerEmail);
    }
  }, 10000);

  it("rejects a pending shop with a reason", async () => {
    const adminEmail = `test-shop-admin-reject-${Date.now()}@example.com`;
    const sellerEmail = `test-shop-seller-reject-${Date.now()}@example.com`;
    await cleanup(adminEmail);
    await cleanup(sellerEmail);

    try {
      const adminId = await register(adminEmail);
      await makeAdmin(adminId);
      const adminToken = await login(adminEmail);

      await register(sellerEmail);
      const sellerToken = await login(sellerEmail);

      const createRes = await request(app)
        .post("/api/v1/shops")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send(shopPayload("Rejected Store"));
      const shopId = createRes.body.data.id as string;

      const rejectRes = await request(app)
        .patch(`/api/v1/shops/${shopId}/reject`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ rejectedReason: "Blurry ID photo" });

      expect(rejectRes.status).toBe(200);
      expect(rejectRes.body.data.approvalStatus).toBe("REJECTED");
      expect(rejectRes.body.data.rejectedReason).toBe("Blurry ID photo");
    } finally {
      await cleanup(adminEmail);
      await cleanup(sellerEmail);
    }
  }, 10000);
});

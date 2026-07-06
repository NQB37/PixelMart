import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app";
import { prisma } from "@/libs/prisma";

describe("Upload Integration Tests", () => {
  const testPassword = "Password123!";

  const cleanupUser = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  };

  const registerUser = async (email: string) => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email, password: testPassword });
    return res.body.data.accessToken as string;
  };

  it("rejects upload without authentication", async () => {
    const res = await request(app)
      .post("/api/v1/uploads")
      .field("folder", "shops/logos");

    expect(res.status).toBe(401);
  });

  it("rejects upload without a file", async () => {
    const email = `test-upload-${Date.now()}@example.com`;
    await cleanupUser(email);

    try {
      const accessToken = await registerUser(email);

      const res = await request(app)
        .post("/api/v1/uploads")
        .set("Authorization", `Bearer ${accessToken}`)
        .field("folder", "shops/logos");

      expect(res.status).toBe(400);
    } finally {
      await cleanupUser(email);
    }
  });

  // ponytail: a successful-upload test would need live Cloudinary credentials,
  // which this test env doesn't have — the happy path is covered manually.
});

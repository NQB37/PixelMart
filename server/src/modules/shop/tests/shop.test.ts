import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "@/app";
import { prisma } from "@/libs/prisma";

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

  it("registers a shop for an authenticated CUSTOMER and grants the SELLER role", async () => {
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

      expect(me.body.data.roles).toEqual(
        expect.arrayContaining(["CUSTOMER", "SELLER"]),
      );
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

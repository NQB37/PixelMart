import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import app from "@/app";
import { prisma } from "@/libs/prisma";

describe("Product Integration Tests", () => {
  const stamp = Date.now();
  const emails = [`test-p1-${stamp}@example.com`, `test-p2-${stamp}@example.com`];

  // Register a user, then approve them as a vendor directly (KYC flow is not what's under test)
  const createVendor = async (email: string) => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ email, password: "Password123!" });
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const vendorRole = await prisma.role.upsert({
      where: { name: "VENDOR" },
      update: {},
      create: { name: "VENDOR" },
    });
    await prisma.roles.create({ data: { userId: user.id, roleId: vendorRole.id } });
    const vendor = await prisma.vendor.create({
      data: { ownerId: user.id, vendorName: `Shop ${email}`, approvalStatus: "APPROVED" },
    });
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: "Password123!" });
    const accessToken = loginRes.body.data.accessToken as string;
    return { accessToken, vendor };
  };

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
  });

  it("creates a product + variant, persists options, and hides it publicly until approved", async () => {
    const [owner, other] = await Promise.all(emails.map(createVendor));
    const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

    const created = await request(app)
      .post("/api/v1/products")
      .set(auth(owner.accessToken))
      .send({ name: "Mint Keyboard", optionNames: ["Color"] });
    expect(created.status).toBe(201);
    const productId = created.body.data.id as string;
    expect(created.body.data.approvalStatus).toBe("PENDING");
    expect(created.body.data.optionNames).toEqual(["Color"]);

    const slug = `mint-keyboard-red-${stamp}`;
    const variant = await request(app)
      .post(`/api/v1/products/${productId}/variants`)
      .set(auth(owner.accessToken))
      .send({
        slug,
        price: 1990,
        stock: 5,
        thumbnail: "https://example.com/kb.jpg",
        options: { Color: "Red" },
        optionsKey: "Color:Red",
      });
    expect(variant.status).toBe(201);
    // these three were silently dropped before the field names matched the model
    expect(variant.body.data.options).toEqual({ Color: "Red" });
    expect(variant.body.data.thumbnail).toBe("https://example.com/kb.jpg");
    expect(variant.body.data.optionsKey).toBe("Color:Red");

    // duplicate option combo on the same product is a conflict, not a 500
    const dupe = await request(app)
      .post(`/api/v1/products/${productId}/variants`)
      .set(auth(owner.accessToken))
      .send({ slug: `${slug}-2`, price: 1990, stock: 1, options: { Color: "Red" }, optionsKey: "Color:Red" });
    expect(dupe.status).toBe(409);

    // another vendor cannot add variants to, or read variants of, someone else's product
    const foreign = await request(app)
      .post(`/api/v1/products/${productId}/variants`)
      .set(auth(other.accessToken))
      .send({ slug: `${slug}-3`, price: 1, stock: 1, options: { Color: "Blue" }, optionsKey: "Color:Blue" });
    expect(foreign.status).toBe(404);
    const foreignRead = await request(app)
      .get(`/api/v1/products/${productId}/variants`)
      .set(auth(other.accessToken));
    expect(foreignRead.status).toBe(404);

    // public list should not show pending variants
    const pendingList = await request(app).get("/api/v1/products/variants");
    expect(pendingList.body.data.some((v: { slug: string }) => v.slug === slug)).toBe(false);

    // still PENDING → invisible to the public
    expect(await request(app).get(`/api/v1/products/variants/${slug}`).then((r) => r.status)).toBe(404);

    // vendor can read product detail by productId
    const ownerDetail = await request(app)
      .get(`/api/v1/products/${productId}`)
      .set(auth(owner.accessToken));
    expect(ownerDetail.status).toBe(200);
    expect(ownerDetail.body.data.name).toBe("Mint Keyboard");

    await prisma.product.update({
      where: { id: productId },
      data: { approvalStatus: "APPROVED", status: "ACTIVE" },
    });

    const detail = await request(app).get(`/api/v1/products/variants/${slug}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.product.name).toBe("Mint Keyboard");

    const list = await request(app).get("/api/v1/products/variants");
    expect(list.body.data.some((v: { slug: string }) => v.slug === slug)).toBe(true);
  });
});

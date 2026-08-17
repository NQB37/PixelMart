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

  it("creates a product + variant, persists options, and hides it publicly while inactive", async () => {
    const [owner, other] = await Promise.all(emails.map(createVendor));
    const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

    const created = await request(app)
      .post("/api/v1/products")
      .set(auth(owner.accessToken))
      .send({ name: "Mint Keyboard", optionNames: ["Color"] });
    expect(created.status).toBe(201);
    const productId = created.body.data.id as string;
    expect(created.body.data.status).toBe("ACTIVE");
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

    // an unpublished product and its variants are invisible to the public
    const unpublished = await request(app)
      .patch(`/api/v1/products/${productId}/status`)
      .set(auth(owner.accessToken))
      .send({ status: "INACTIVE" });
    expect(unpublished.status).toBe(200);
    expect(unpublished.body.data.status).toBe("INACTIVE");
    // the status route is publish/unpublish only — no archiving through it
    expect(
      await request(app)
        .patch(`/api/v1/products/${productId}/status`)
        .set(auth(owner.accessToken))
        .send({ status: "ARCHIVED" })
        .then((r) => r.status),
    ).toBe(400);
    const inactiveList = await request(app).get("/api/v1/products/variants");
    expect(inactiveList.body.data.some((v: { slug: string }) => v.slug === slug)).toBe(false);
    expect(await request(app).get(`/api/v1/products/variants/${slug}`).then((r) => r.status)).toBe(404);

    // vendor can read product detail by productId
    const ownerDetail = await request(app)
      .get(`/api/v1/products/${productId}`)
      .set(auth(owner.accessToken));
    expect(ownerDetail.status).toBe(200);
    expect(ownerDetail.body.data.name).toBe("Mint Keyboard");
    const foreignDetail = await request(app)
      .get(`/api/v1/products/${productId}`)
      .set(auth(other.accessToken));
    expect(foreignDetail.status).toBe(404);

    // published again → back on the storefront
    await request(app)
      .patch(`/api/v1/products/${productId}/status`)
      .set(auth(owner.accessToken))
      .send({ status: "ACTIVE" });

    const detail = await request(app).get(`/api/v1/products/variants/${slug}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.product.name).toBe("Mint Keyboard");

    const list = await request(app).get("/api/v1/products/variants");
    expect(list.body.data.some((v: { slug: string }) => v.slug === slug)).toBe(true);

    // a banned product is frozen: no edit, no status change, no archiving
    await prisma.product.update({ where: { id: productId }, data: { status: "BANNED" } });
    for (const res of await Promise.all([
      request(app)
        .patch(`/api/v1/products/${productId}`)
        .set(auth(owner.accessToken))
        .send({ name: "Renamed While Banned" }),
      request(app)
        .patch(`/api/v1/products/${productId}/status`)
        .set(auth(owner.accessToken))
        .send({ status: "ACTIVE" }),
      request(app).delete(`/api/v1/products/${productId}`).set(auth(owner.accessToken)),
    ])) {
      expect(res.status).toBe(403);
    }
    await prisma.product.update({ where: { id: productId }, data: { status: "ACTIVE" } });

    // archive → restore comes back as a draft, and a live product cannot be restored
    await request(app).delete(`/api/v1/products/${productId}`).set(auth(owner.accessToken));
    const restored = await request(app)
      .patch(`/api/v1/products/${productId}/restore`)
      .set(auth(owner.accessToken));
    expect(restored.status).toBe(200);
    expect(restored.body.data.status).toBe("INACTIVE");
    expect(restored.body.data.deletedAt).toBeNull();
    expect(
      await request(app)
        .patch(`/api/v1/products/${productId}/restore`)
        .set(auth(owner.accessToken))
        .then((r) => r.status),
    ).toBe(400);
    // and not by another vendor
    expect(
      await request(app)
        .patch(`/api/v1/products/${productId}/restore`)
        .set(auth(other.accessToken))
        .then((r) => r.status),
    ).toBe(404);
  });
});

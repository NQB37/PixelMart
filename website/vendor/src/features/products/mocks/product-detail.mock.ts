import type { ProductDetail, ProductVariant } from "../types/product";

// ponytail: static mock until GET /products/:id (with variants) exists on the API.
const variant = (
  id: string,
  options: Record<string, string>,
  price: number,
  stock: number,
  sku: string | null,
  thumbnail: string | null,
): ProductVariant => ({
  id,
  productId: "mock-product",
  slug: `iphone-17-pro-${id}`,
  description: "Titanium body, A19 Pro chip, 6.3″ Super Retina XDR.",
  sku,
  price,
  stock,
  metaTitle: null,
  metaDescription: null,
  thumbnail: thumbnail ? `https://picsum.photos/seed/${thumbnail}/88` : null,
  options,
  optionsKey: Object.values(options).join("/"),
  createdAt: "2026-07-02T09:12:00.000Z",
  updatedAt: "2026-08-01T14:30:00.000Z",
});

export const MOCK_PRODUCT_DETAIL: ProductDetail = {
  id: "mock-product",
  name: "Iphone 17 Pro",
  brandId: "mock-brand",
  brandName: "Apple",
  categories: ["Phones", "Smartphones"],
  status: "ACTIVE",
  approvalStatus: "APPROVED",
  rejectedReason: null,
  optionNames: ["Color", "Storage"],
  createdAt: "2026-07-02T09:12:00.000Z",
  updatedAt: "2026-08-01T14:30:00.000Z",
  variants: [
    variant(
      "v1",
      { Color: "Natural Titanium", Storage: "256GB" },
      1199,
      24,
      "IP17P-NT-256",
      "titanium",
    ),
    variant(
      "v2",
      { Color: "Natural Titanium", Storage: "512GB" },
      1399,
      8,
      "IP17P-NT-512",
      "titanium",
    ),
    variant(
      "v3",
      { Color: "Deep Blue", Storage: "256GB" },
      1199,
      0,
      "IP17P-DB-256",
      "deep-blue",
    ),
    variant("v4", { Color: "Deep Blue", Storage: "1TB" }, 1699, 3, null, null),
  ],
};

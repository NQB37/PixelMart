import * as z from "zod";

export const createProductSchema = z.object({
  brandId: z.uuid().optional(),
  categoryId: z.array(z.uuid()).optional(),
  // General
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(100, "Product name must be at most 100 characters")
    .trim(),
  // Options
  optionNames: z.array(z.string().trim().min(1, "Option name is required")),
});

// Update takes the create fields plus the publish switch — ARCHIVED comes from
// deleting, BANNED from an admin, so a vendor only picks between these two.
export const updateProductSchema = createProductSchema.extend({
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

// ponytail: mirrors the server's createProductVariantSchema minus the fields no
// form asks for yet (description, meta*) — optionsKey is derived in the service.
export const createVariantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Variant name is required")
    .max(100, "Variant name must be at most 100 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be at most 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase, dash-separated",
    ),
  sku: z.string().trim().optional(),
  price: z.number("Price is required").min(0, "Price cannot be negative"),
  stock: z
    .number("Stock is required")
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  options: z.record(z.string(), z.string().trim().min(1, "Required")),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;

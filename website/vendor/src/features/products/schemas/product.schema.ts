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

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

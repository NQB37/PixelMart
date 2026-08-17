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

// ponytail: the update endpoint takes the exact same fields — one schema, two names.
// `status` is deliberately absent: the server's updateProductSchema drops it.
export const updateProductSchema = createProductSchema;

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = CreateProductInput;

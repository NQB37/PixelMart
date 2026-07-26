import * as z from "zod";

export const createBrandSchema = z.object({
  name: z
    .string()
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name must be at most 100 characters")
    .trim(),
});

export const updateBrandSchema = z.object({
  name: z
    .string()
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name must be at most 100 characters")
    .trim()
    .optional(),
  slug: z.string().optional(),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

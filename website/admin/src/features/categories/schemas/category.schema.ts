import * as z from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be at most 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Category description must be at most 500 characters")
    .optional(),
  imageUrl: z.url().optional(),
  parentId: z.uuid().or(z.literal("")).optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be at most 100 characters")
    .trim()
    .optional(),
  slug: z.string().optional(),
  description: z
    .string()
    .max(500, "Category description must be at most 500 characters")
    .optional(),
  imageUrl: z.url().nullable().optional(),
  parentId: z.uuid().or(z.literal("")).optional().nullable(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

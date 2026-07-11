import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100).trim(),
  description: z.string().max(500).optional(),
  image: z.url().optional(),
  parentId: z.uuid().optional().nullable(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  slug: z.string().optional(),
  description: z.string().max(500).optional(),
  image: z.url().optional(),
  parentId: z.uuid().optional().nullable(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

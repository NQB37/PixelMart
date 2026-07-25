import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100).trim(),
  description: z.string().max(500).optional(),
  imageUrl: z.url().optional(),
  parentId: z.uuid().optional().nullable(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  slug: z.string().optional(),
  description: z.string().max(500).optional(),
  // null = xoá ảnh (cột nullable), client gửi lại giá trị nó vừa nhận được
  imageUrl: z.url().nullable().optional(),
  parentId: z.uuid().optional().nullable(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

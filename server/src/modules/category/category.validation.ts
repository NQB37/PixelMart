import { z } from 'zod';

const slugSchema = z
  .string()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, dash-separated');

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100).trim(),
  slug: slugSchema,
  description: z.string().max(500).optional(),
  imageUrl: z.url().optional(),
  parentId: z.uuid().optional().nullable(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  slug: slugSchema.optional(),
  description: z.string().max(500).optional(),
  // null = xoá ảnh (cột nullable), client gửi lại giá trị nó vừa nhận được
  imageUrl: z.url().nullable().optional(),
  parentId: z.uuid().optional().nullable(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

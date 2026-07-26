import { z } from 'zod';

const slugSchema = z
  .string()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, dash-separated');

export const createBrandSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  slug: slugSchema,
});

export const updateBrandSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  slug: slugSchema.optional(),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

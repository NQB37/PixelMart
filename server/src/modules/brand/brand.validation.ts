import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(2).max(100).trim(),
});

export const updateBrandSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  // omit to let a rename re-derive it
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase, dash-separated',
    )
    .optional(),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

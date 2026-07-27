import { z } from 'zod';
import { slugSchema } from '@/utils/slug';

export const createProductSchema = z.object({
  // General info
  vendorId: z.uuid('Vendor ID is required'),
  brandId: z.uuid().optional(),
  categoryId: z.array(z.uuid()).optional(),
  name: z
    .string('Name is required')
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must be at most 100 characters')
    .trim(),
  slug: slugSchema,
  sku: z.string().optional(),
  description: z.string().optional(),

  // Metadata
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),

  // Media
  thumbnail: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

import { z } from 'zod';
import { slugSchema } from '@/utils/slug';
import { ApprovalStatus } from '@/generated/prisma/client';

export const createProductSchema = z.object({
  // General info — vendorId comes from the authenticated vendor, not the body
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

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  approvalStatus: z.enum(ApprovalStatus),
});

export const rejectProductSchema = z.object({
  rejectedReason: z
    .string()
    .trim()
    .min(1, 'Rejection reason is required')
    .max(500),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type RejectProductInput = z.infer<typeof rejectProductSchema>;

import { z } from 'zod';
import { ApprovalStatus } from '@/generated/prisma/client';
import { slugSchema } from '@/utils/slug';

export const createProductSchema = z.object({
  // General info — vendorId comes from the authenticated vendor, not the body
  brandId: z.uuid().optional(),
  categoryId: z.array(z.uuid()).optional(),
  name: z
    .string('Name is required')
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must be at most 100 characters')
    .trim(),
  optionNames: z.array(z.string().trim().min(1)).optional(),
});

export const updateProductSchema = z.object({
  brandId: z.uuid().optional(),
  categoryId: z.array(z.uuid()).optional(),
  name: z
    .string('Name is required')
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must be at most 100 characters')
    .trim(),
  optionNames: z.array(z.string().trim().min(1)).optional(),
});

export const createProductVariantSchema = z.object({
  // Meta
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),

  // General info
  slug: slugSchema,
  description: z.string().optional(),

  // Sell info
  sku: z.string().optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),

  // Media
  thumbnail: z.url().optional(),

  // Option
  options: z.record(z.string(), z.string()),
  optionsKey: z.string().trim().min(1),
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
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateProductVariantInput = z.infer<
  typeof createProductVariantSchema
>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type RejectProductInput = z.infer<typeof rejectProductSchema>;

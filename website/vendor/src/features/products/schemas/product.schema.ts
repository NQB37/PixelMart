import * as z from "zod";
import { slugSchema } from "@website/shared/utils";

export const createProductSchema = z.object({
  brandId: z.uuid().optional(),
  categoryId: z.array(z.uuid()).optional(),
  // General
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be at most 100 characters")
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

export const updateProductSchema = createProductSchema.partial().extend({
  brandId: z.uuid().optional(),
  categoryId: z.array(z.uuid()).optional(),
  // General
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be at most 100 characters")
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
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

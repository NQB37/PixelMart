import { prisma } from '@/libs/prisma';
import { CreateProductInput } from './product.validation';
import { ApiError } from '@/utils/ApiError';

class ProductService {
  // Public
  async getAllProduct() {
    return prisma.product.findMany();
  }
  async getProductBySlug(slug: string) {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { slug },
    });
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return product;
  }
  // Shop
  async getVendorProducts(vendorId: string) {
    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });
    if (!vendor) {
      throw ApiError.notFound('Vendor not found');
    }

    return prisma.product.findMany({
      where: { vendorId },
    });
  }

  async createProduct(input: CreateProductInput) {
    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: input.vendorId },
    });
    if (!vendor) {
      throw ApiError.notFound('Vendor not found');
    }

    // Check if slug already exists
    const slugExists = await prisma.product.findUnique({
      where: { slug: input.slug },
    });
    if (slugExists) {
      throw ApiError.conflict('Slug already exists');
    }

    // Check if SKU exists
    if (input.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { vendorId_sku: { vendorId: vendor.id, sku: input.sku } },
      });
      if (skuExists) {
        throw ApiError.conflict('SKU already exists');
      }
    }

    // Check if category exists
    if (input.categoryId) {
      const categories = await prisma.productCategory.findMany({
        where: { id: { in: input.categoryId } },
      });
      if (categories.length !== input.categoryId.length) {
        throw ApiError.notFound('Some categories do not exist');
      }
    }

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: input.brandId },
    });
    if (!brand) {
      throw ApiError.notFound('Brand not found');
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        ...input,
        approvalStatus: 'PENDING',
      },
    });

    return product;
  }
  // Admin

  // Private
}

export const productService = new ProductService();

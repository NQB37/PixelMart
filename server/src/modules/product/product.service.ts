import { prisma } from '@/libs/prisma';
import { CreateProductInput, ListProductsQuery } from './product.validation';
import { ApiError } from '@/utils/ApiError';
import { ApprovalStatus, ProductStatus } from '@/generated/prisma/enums';
import type { Prisma } from '@/generated/prisma/client';

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

  async createProduct(vendorId: string, input: CreateProductInput) {
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
        where: { vendorId_sku: { vendorId, sku: input.sku } },
      });
      if (skuExists) {
        throw ApiError.conflict('SKU already exists');
      }
    }

    // Check if categories exist
    const { categoryId, ...data } = input;
    if (categoryId?.length) {
      const count = await prisma.category.count({
        where: { id: { in: categoryId } },
      });
      if (count !== categoryId.length) {
        throw ApiError.notFound('Some categories do not exist');
      }
    }

    // Check if brand exists
    if (input.brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: input.brandId },
      });
      if (!brand) {
        throw ApiError.notFound('Brand not found');
      }
    }

    // Create product
    return prisma.product.create({
      data: {
        ...data,
        vendorId,
        approvalStatus: 'PENDING',
        ...(categoryId?.length && {
          productCategories: {
            create: categoryId.map((id, index) => ({
              categoryId: id,
              isMain: index === 0,
            })),
          },
        }),
      },
    });
  }
  // Admin
  async getAdminProducts({
    page,
    limit,
    search,
    approvalStatus,
  }: ListProductsQuery) {
    const where = {
      approvalStatus,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { sku: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { vendor: { select: { vendorName: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getProductById(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        vendor: { select: { id: true, vendorName: true } },
        brand: { select: { name: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        productCategories: {
          include: { category: { select: { name: true } } },
        },
      },
    });
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }

  async approveProduct(productId: string) {
    return prisma.$transaction(async (tx) => {
      await this.findPendingProduct(tx, productId);

      return tx.product.update({
        where: { id: productId },
        data: {
          approvalStatus: ApprovalStatus.APPROVED,
          rejectedReason: null,
          status: ProductStatus.ACTIVE,
        },
      });
    });
  }

  async rejectProduct(productId: string, rejectedReason: string) {
    return prisma.$transaction(async (tx) => {
      await this.findPendingProduct(tx, productId);

      return tx.product.update({
        where: { id: productId },
        data: { approvalStatus: ApprovalStatus.REJECTED, rejectedReason },
      });
    });
  }
  // Private
  private async findPendingProduct(
    tx: Prisma.TransactionClient,
    productId: string,
  ) {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    if (product.approvalStatus !== ApprovalStatus.PENDING) {
      throw ApiError.badRequest('Product has already been reviewed');
    }

    return product;
  }
}

export const productService = new ProductService();

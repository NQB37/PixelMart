import { prisma } from '@/libs/prisma';
import {
  CreateProductInput,
  CreateProductVariantInput,
  ListProductsQuery,
} from './product.validation';
import { ApiError } from '@/utils/ApiError';
import { ApprovalStatus, ProductStatus } from '@/generated/prisma/enums';
import type { Prisma } from '@/generated/prisma/client';

// Only variants of published products are visible publicly
const PUBLIC_PRODUCT = {
  product: {
    approvalStatus: ApprovalStatus.APPROVED,
    status: { in: [ProductStatus.ACTIVE, ProductStatus.OUT_OF_STOCK] },
    deletedAt: null,
  },
} satisfies Prisma.ProductVariantWhereInput;

class ProductService {
  // Public
  async getAllProductsVariant() {
    return prisma.productVariant.findMany({
      where: PUBLIC_PRODUCT,
      include: { product: { select: { name: true, brand: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductVariantBySlug(slug: string) {
    // findFirst (not findUnique) so a hidden product 404s instead of leaking
    const variant = await prisma.productVariant.findFirst({
      where: { slug, ...PUBLIC_PRODUCT },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        product: {
          include: {
            vendor: { select: { id: true, vendorName: true } },
            brand: { select: { name: true } },
            productCategories: {
              include: { category: { select: { name: true } } },
            },
            variants: true,
          },
        },
      },
    });
    if (!variant) {
      throw ApiError.notFound('Product not found');
    }

    return variant;
  }

  // Shop
  async getVendorProducts(vendorId: string) {
    return prisma.product.findMany({
      where: { vendorId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { variants: true },
    });
  }

  async getProductVariants(vendorId: string, productId: string) {
    await this.findVendorProduct(vendorId, productId);

    return prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createProduct(vendorId: string, input: CreateProductInput) {
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

  async createProductVariant(
    vendorId: string,
    productId: string,
    input: CreateProductVariantInput,
  ) {
    await this.findVendorProduct(vendorId, productId);

    // slug is globally unique; sku and optionsKey are unique per product
    const clash = await prisma.productVariant.findFirst({
      where: {
        OR: [
          { slug: input.slug },
          { productId, optionsKey: input.optionsKey },
          ...(input.sku ? [{ productId, sku: input.sku }] : []),
        ],
      },
    });
    if (clash) {
      if (clash.slug === input.slug) {
        throw ApiError.conflict('Slug already exists');
      }
      if (clash.optionsKey === input.optionsKey) {
        throw ApiError.conflict('A variant with these options already exists');
      }
      throw ApiError.conflict('SKU already exists');
    }

    return prisma.productVariant.create({
      data: { ...input, productId },
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
          {
            variants: {
              some: { sku: { contains: search, mode: 'insensitive' as const } },
            },
          },
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
        productCategories: {
          include: { category: { select: { name: true } } },
        },
        variants: { include: { images: { orderBy: { sortOrder: 'asc' } } } },
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
  private async findVendorProduct(vendorId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, vendorId, deletedAt: null },
    });
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }

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

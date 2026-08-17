import { prisma } from '@/libs/prisma';
import {
  CreateProductInput,
  CreateProductVariantInput,
  ListProductsQuery,
  UpdateProductInput,
  UpdateProductStatusInput,
} from './product.validation';
import { ApiError } from '@/utils/ApiError';
import { ProductStatus } from '@/generated/prisma/enums';
import type { Prisma } from '@/generated/prisma/client';

// Only variants of published products are visible publicly
const PUBLIC_PRODUCT = {
  product: {
    status: ProductStatus.ACTIVE,
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
    const products = await prisma.product.findMany({
      // archived (soft-deleted) products stay in the vendor's own list
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      include: {
        variants: true,
        productCategories: { select: { categoryId: true } },
      },
    });

    // flatten the join rows so the client gets the same categoryId[] it sends
    return products.map(({ productCategories, ...product }) => ({
      ...product,
      categoryId: productCategories.map((pc) => pc.categoryId),
    }));
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

  async updateProduct(
    vendorId: string,
    productId: string,
    input: UpdateProductInput,
  ) {
    await this.findVendorProduct(vendorId, productId);

    const { categoryId, brandId, ...data } = input;

    if (categoryId?.length) {
      const count = await prisma.category.count({
        where: { id: { in: categoryId } },
      });
      if (count !== categoryId.length) {
        throw ApiError.notFound('Some categories do not exist');
      }
    }

    return prisma.product.update({
      where: { id: productId },
      data: {
        ...data,
        brandId: brandId || null,
        // replacing the whole set in one nested write keeps it atomic
        ...(categoryId?.length && {
          productCategories: {
            deleteMany: {},
            create: categoryId.map((id, index) => ({
              categoryId: id,
              isMain: index === 0,
            })),
          },
        }),
      },
    });
  }

  async updateProductStatus(
    vendorId: string,
    productId: string,
    { status }: UpdateProductStatusInput,
  ) {
    await this.findVendorProduct(vendorId, productId);

    return prisma.product.update({
      where: { id: productId },
      data: { status },
    });
  }

  async deleteProduct(vendorId: string, productId: string) {
    await this.findVendorProduct(vendorId, productId);

    return prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date(), status: ProductStatus.ARCHIVED },
    });
  }

  async restoreProduct(vendorId: string, productId: string) {
    const product = await this.findVendorProduct(vendorId, productId, true);
    if (!product.deletedAt) {
      throw ApiError.badRequest('Product is not archived');
    }

    // restored as a draft — the vendor publishes it again themselves
    return prisma.product.update({
      where: { id: productId },
      data: { deletedAt: null, status: ProductStatus.INACTIVE },
    });
  }

  async deleteProductPermanent(vendorId: string, productId: string) {
    await this.findVendorProduct(vendorId, productId, true);

    return prisma.product.delete({
      where: { id: productId },
    });
  }

  async createProductVariant(
    vendorId: string,
    productId: string,
    input: CreateProductVariantInput,
  ) {
    await this.findVendorProduct(vendorId, productId);

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
  async getAdminProducts({ page, limit, search }: ListProductsQuery) {
    const where = {
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

  // ownerId scopes the lookup to that user's own shop — admins pass nothing
  async getProductById(productId: string, ownerId?: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, ...(ownerId && { vendor: { ownerId } }) },
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

  // Private
  private async findVendorProduct(
    vendorId: string,
    productId: string,
    // only restore + permanent delete may target an already-archived product
    includeDeleted = false,
  ) {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        vendorId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }
}

export const productService = new ProductService();

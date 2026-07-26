import { prisma } from '@/libs/prisma';
import { CreateBrandInput, UpdateBrandInput } from './brand.validation';
import { ApiError } from '@/utils/ApiError';
import { generateSlug } from '@/utils/slug';

class BrandService {
  // PUBLIC
  async getAllBrands() {
    const brands = await prisma.brand.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return brands;
  }
  async getBrandBySlug(slug: string) {
    const brand = await prisma.brand.findUnique({ where: { slug } });

    if (!brand) throw ApiError.notFound('Brand not found');

    return brand;
  }
  // ADMIN
  async createBrand(data: CreateBrandInput) {
    // Check brand name/slug exist
    const slug = generateSlug(data.name);
    const existingBrand = await prisma.brand.findFirst({
      where: { OR: [{ name: data.name }, { slug }] },
    });
    if (existingBrand) throw ApiError.conflict('Brand already exists');

    // Create brand
    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        slug,
      },
    });

    return brand;
  }
  async updateBrand(id: string, data: UpdateBrandInput) {
    // Check brand exist
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) throw ApiError.notFound('Brand not found');

    const name = data.name ?? brand.name;
    const slug =
      data.slug ?? (name !== brand.name ? generateSlug(name) : brand.slug);
    if (name === brand.name && slug === brand.slug) return brand;

    // Check brand name/slug taken by another brand
    const existingBrand = await prisma.brand.findFirst({
      where: { id: { not: id }, OR: [{ name }, { slug }] },
    });
    if (existingBrand) throw ApiError.conflict('Brand already exists');

    // Update brand
    return prisma.brand.update({ where: { id }, data: { name, slug } });
  }
  async deleteBrand(id: string) {
    // Check brand exist
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) throw ApiError.notFound('Brand not found');

    // Check brand product count
    const productCount = await prisma.product.count({
      where: { brandId: id },
    });
    if (productCount > 0) {
      throw ApiError.conflict('Cannot delete brand because it has products');
    }

    // Delete brand
    await prisma.brand.delete({ where: { id } });

    return { deleted: true };
  }
  // PRIVATE
}

export const brandService = new BrandService();

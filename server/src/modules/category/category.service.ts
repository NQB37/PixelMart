import { generateSlug } from '@/utils/slug';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from './category.validation';
import { prisma } from '@/libs/prisma';
import { ApiError } from '@/utils/ApiError';

class CategoryService {
  // =========== PUBLIC ===========
  public async getAllCategories() {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  }

  public async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({ where: { slug } });

    if (!category) throw ApiError.notFound('Category not found');

    return category;
  }

  // =========== ADMIN ===========
  public async createCategory(data: CreateCategoryInput) {
    // Check if name already exists
    const slug = generateSlug(data.name);
    const slugExists = await prisma.category.findUnique({ where: { slug } });
    if (slugExists) throw ApiError.conflict('Category already exists');

    // Check if parent category exists
    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) throw ApiError.notFound('Parent category not found');
    }

    // Create category
    const category = await prisma.category.create({
      data: { ...data, slug },
    });

    return category;
  }

  async updateCategory(id: string, data: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw ApiError.notFound('Category not found');

    // If name changes → update slug
    if (data.name && data.name !== category.name) {
      data.slug = generateSlug(data.name);
    }

    // Check if slug already exists
    if (data.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) throw ApiError.conflict('Slug already exists');
    }

    // Check if parent category exists
    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) throw ApiError.notFound('Parent category not found');
    }

    // Cannot create circular reference
    if (data.parentId === id) {
      throw ApiError.badRequest('Category cannot be its own parent');
    }

    return prisma.category.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    const productCount = await prisma.product.count({
      where: { categoryId: id, deletedAt: null },
    });

    if (productCount > 0) {
      throw ApiError.conflict('Cannot delete category because it has products');
    }

    // Delete category
    await prisma.category.delete({ where: { id } });

    return { deleted: true };
  }
}

export const categoryService = new CategoryService();

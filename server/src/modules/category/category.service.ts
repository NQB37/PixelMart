import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from './category.validation';
import { prisma } from '@/libs/prisma';
import { ApiError } from '@/utils/ApiError';
import type { Category } from '@/generated/prisma/client';

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
    // Check if slug already exists
    const slugExists = await prisma.category.findUnique({
      where: { slug: data.slug },
    });
    if (slugExists) throw ApiError.conflict('Category already exists');

    // Check if parent category exists
    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) throw ApiError.notFound('Parent category not found');
    }

    // Create category
    const category = await prisma.category.create({ data });

    return category;
  }

  async updateCategory(id: string, data: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw ApiError.notFound('Category not found');

    // Check if slug already exists
    if (data.slug && data.slug !== category.slug) {
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
    if (await this.checkCycle(id, data.parentId)) {
      throw ApiError.conflict('Cannot create circular reference');
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

  // =========== PRIVATE ===========
  private async checkCycle(categoryId: string, newParentId?: string | null) {
    // Cannot set parent to itself
    if (categoryId === newParentId) return true;

    let currentParentId: string | null | undefined = newParentId;

    // Traverse up the parent chain to detect cycle
    while (currentParentId) {
      // Detect cycle: current parent is the same as the category
      if (currentParentId === categoryId) return true;

      // Get the parent of the current parent
      const parent: Category | null = await prisma.category.findUnique({
        where: { id: currentParentId },
      });

      if (!parent) break;

      // Move up to the next parent
      currentParentId = parent.parentId;
    }

    return false;
  }
}

export const categoryService = new CategoryService();

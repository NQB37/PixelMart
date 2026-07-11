import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/ApiResponse';
import { categoryService } from './category.service';

// === PUBLIC ROUTES ===
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();

  ApiResponse.success(res, categories);
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params as { slug: string };
  const category = await categoryService.getCategoryBySlug(slug);

  ApiResponse.success(res, category);
});

// === ADMIN ROUTES ===
const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  ApiResponse.created(res, category, 'Category created successfully');
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.id as string,
    req.body,
  );

  ApiResponse.success(res, category, 'Category updated successfully');
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.deleteCategory(
    req.params.id as string,
  );

  ApiResponse.success(res, category, 'Category deleted successfully');
});

export {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};

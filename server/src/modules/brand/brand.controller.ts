import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/ApiResponse';
import { brandService } from './brand.service';

// === PUBLIC ROUTES ===
const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await brandService.getAllBrands();

  ApiResponse.success(res, brands);
});

const getBrandBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params as { slug: string };
  const brand = await brandService.getBrandBySlug(slug);

  ApiResponse.success(res, brand);
});

// === ADMIN ROUTES ===
const createBrand = asyncHandler(async (req, res) => {
  const brand = await brandService.createBrand(req.body);

  ApiResponse.created(res, brand, 'Brand created successfully');
});

const updateBrand = asyncHandler(async (req, res) => {
  const brand = await brandService.updateBrand(
    req.params.id as string,
    req.body,
  );

  ApiResponse.success(res, brand, 'Brand updated successfully');
});

const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await brandService.deleteBrand(req.params.id as string);

  ApiResponse.success(res, brand, 'Brand deleted successfully');
});

export { getAllBrands, getBrandBySlug, createBrand, updateBrand, deleteBrand };

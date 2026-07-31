import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/ApiResponse';
import { productService } from './product.service';

// === PUBLIC ROUTES ===
const getAllProducts = asyncHandler(async (_req, res) => {
  const products = await productService.getAllProduct();

  ApiResponse.success(res, products);
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params as { slug: string };
  const product = await productService.getProductBySlug(slug);

  ApiResponse.success(res, product);
});

// === VENDOR ROUTES ===
const getMyProducts = asyncHandler(async (req, res) => {
  const products = await productService.getVendorProducts(req.vendor!.id);

  ApiResponse.success(res, products);
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.vendor!.id, req.body);

  ApiResponse.created(res, product, 'Product created successfully');
});

export { getAllProducts, getProductBySlug, getMyProducts, createProduct };

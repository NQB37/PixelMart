import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/ApiResponse';
import { productService } from './product.service';
import { ListProductsQuery, RejectProductInput } from './product.validation';

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

// === ADMIN ROUTES ===
const getAdminProducts = asyncHandler(async (req, res) => {
  const products = await productService.getAdminProducts(
    req.validatedQuery as unknown as ListProductsQuery,
  );

  ApiResponse.success(res, products);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id as string);

  ApiResponse.success(res, product);
});

const approveProduct = asyncHandler(async (req, res) => {
  const product = await productService.approveProduct(req.params.id as string);

  ApiResponse.success(res, product, 'Product approved successfully');
});

const rejectProduct = asyncHandler(async (req, res) => {
  const { rejectedReason } = req.body as RejectProductInput;
  const product = await productService.rejectProduct(
    req.params.id as string,
    rejectedReason,
  );

  ApiResponse.success(res, product, 'Product rejected successfully');
});

export {
  getAllProducts,
  getProductBySlug,
  getMyProducts,
  createProduct,
  getAdminProducts,
  getProductById,
  approveProduct,
  rejectProduct,
};

import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/ApiResponse';
import { productService } from './product.service';
import { ListProductsQuery, RejectProductInput } from './product.validation';

// === PUBLIC ROUTES ===
const getAllProductsVariant = asyncHandler(async (_req, res) => {
  const products = await productService.getAllProductsVariant();

  ApiResponse.success(res, products);
});

const getProductVariantBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params as { slug: string };
  const product = await productService.getProductVariantBySlug(slug);

  ApiResponse.success(res, product);
});

// === VENDOR ROUTES ===
const getMyProducts = asyncHandler(async (req, res) => {
  const products = await productService.getVendorProducts(req.vendor!.id);

  ApiResponse.success(res, products);
});

const getProductVariants = asyncHandler(async (req, res) => {
  const { productId } = req.params as { productId: string };
  const productVariants = await productService.getProductVariants(
    req.vendor!.id,
    productId,
  );

  ApiResponse.success(res, productVariants);
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.vendor!.id, req.body);

  ApiResponse.created(res, product, 'Product created successfully');
});

const createProductVariant = asyncHandler(async (req, res) => {
  const { productId } = req.params as { productId: string };
  const product = await productService.createProductVariant(
    req.vendor!.id,
    productId,
    req.body,
  );

  ApiResponse.created(res, product, 'Product variant created successfully');
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
  getAllProductsVariant,
  getProductVariantBySlug,
  getMyProducts,
  getProductVariants,
  createProduct,
  createProductVariant,
  getAdminProducts,
  getProductById,
  approveProduct,
  rejectProduct,
};

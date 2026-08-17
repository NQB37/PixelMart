import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/ApiResponse';
import { productService } from './product.service';
import { ListProductsQuery } from './product.validation';
import { ROLE } from '@/generated/prisma/client';

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
const getVendorProducts = asyncHandler(async (req, res) => {
  const products = await productService.getVendorProducts(req.vendor!.id);

  ApiResponse.success(res, products);
});

const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params as { productId: string };
  const isAdmin = req.user!.roles.includes(ROLE.ADMIN);
  const product = await productService.getProductById(
    productId,
    isAdmin ? undefined : req.user!.userId,
  );

  ApiResponse.success(res, product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params as { productId: string };
  const product = await productService.updateProduct(
    req.vendor!.id,
    productId,
    req.body,
  );

  ApiResponse.success(res, product, 'Product updated successfully');
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params as { productId: string };
  const product = await productService.deleteProduct(req.vendor!.id, productId);

  ApiResponse.success(res, product, 'Product deleted successfully');
});

const restoreProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params as { productId: string };
  const product = await productService.restoreProduct(
    req.vendor!.id,
    productId,
  );

  ApiResponse.success(res, product, 'Product restored successfully');
});

const deleteProductPermanent = asyncHandler(async (req, res) => {
  const { productId } = req.params as { productId: string };
  const product = await productService.deleteProductPermanent(
    req.vendor!.id,
    productId,
  );

  ApiResponse.success(res, product, 'Product deleted successfully');
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

export {
  getAllProductsVariant,
  getProductVariantBySlug,
  getVendorProducts,
  updateProduct,
  deleteProduct,
  restoreProduct,
  deleteProductPermanent,
  getProductVariants,
  createProduct,
  createProductVariant,
  getAdminProducts,
  getProductById,
};

import { Router } from 'express';
import * as productController from './product.controller';
import { isAuth } from '@/middlewares/auth.middleware';
import { isVendorOwner } from '@/middlewares/isVendorOwner.middleware';
import { validate, validateQuery } from '@/middlewares/validate.middleware';
import { requireRole } from '@/middlewares/role.middleware';
import {
  createProductSchema,
  createProductVariantSchema,
  listProductsQuerySchema,
  updateProductSchema,
  updateProductStatusSchema,
  updateProductVariantSchema,
} from './product.validation';
import { ROLE } from '@/generated/prisma/client';

const router = Router();

// === PUBLIC ROUTES ===
router.get('/variants', productController.getAllProductsVariant);
router.get('/variants/:slug', productController.getProductVariantBySlug);

// === AUTHENTICATED ROUTES ===
// Product
router.get('/me', isAuth, isVendorOwner, productController.getVendorProducts);
router.get(
  '/admin',
  isAuth,
  requireRole(ROLE.ADMIN),
  validateQuery(listProductsQuerySchema),
  productController.getAdminProducts,
);

router.post(
  '/',
  isAuth,
  isVendorOwner,
  validate(createProductSchema),
  productController.createProduct,
);

router.patch(
  '/:productId',
  isAuth,
  isVendorOwner,
  validate(updateProductSchema),
  productController.updateProduct,
);

router.delete(
  '/:productId',
  isAuth,
  isVendorOwner,
  productController.deleteProduct,
);

router.patch(
  '/:productId/status',
  isAuth,
  isVendorOwner,
  validate(updateProductStatusSchema),
  productController.updateProductStatus,
);

router.patch(
  '/:productId/restore',
  isAuth,
  isVendorOwner,
  productController.restoreProduct,
);

router.delete(
  '/:productId/permanent',
  isAuth,
  isVendorOwner,
  productController.deleteProductPermanent,
);

// Variant
router.get(
  '/me/variants/:slug',
  isAuth,
  isVendorOwner,
  productController.getVendorVariantBySlug,
);

router.get(
  '/:productId/variants',
  isAuth,
  isVendorOwner,
  productController.getProductVariants,
);

router.post(
  '/:productId/variants',
  isAuth,
  isVendorOwner,
  validate(createProductVariantSchema),
  productController.createProductVariant,
);

router.patch(
  '/:productId/variants/:variantId',
  isAuth,
  isVendorOwner,
  validate(updateProductVariantSchema),
  productController.updateProductVariant,
);

router.delete(
  '/:productId/variants/:variantId',
  isAuth,
  isVendorOwner,
  productController.deleteProductVariant,
);

// === DETAIL ROUTES (Placed after static routes) ===
router.get(
  '/:productId',
  isAuth,
  requireRole(ROLE.ADMIN, ROLE.VENDOR),
  productController.getProductById,
);

export const productRoutes = router;

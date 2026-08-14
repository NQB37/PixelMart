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
  rejectProductSchema,
  updateProductSchema,
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

router.delete(
  '/:productId/permanent',
  isAuth,
  isVendorOwner,
  productController.deleteProductPermanent,
);

router.patch(
  '/:id/approve',
  isAuth,
  requireRole(ROLE.ADMIN),
  productController.approveProduct,
);

router.patch(
  '/:id/reject',
  isAuth,
  requireRole(ROLE.ADMIN),
  validate(rejectProductSchema),
  productController.rejectProduct,
);

// Variant
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

// === DETAIL ROUTES (Placed after static routes) ===
router.get(
  '/:productId',
  isAuth,
  requireRole(ROLE.ADMIN, ROLE.VENDOR),
  productController.getProductById,
);

export const productRoutes = router;

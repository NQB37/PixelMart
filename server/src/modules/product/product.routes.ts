import { Router } from 'express';
import * as productController from './product.controller';
import { isAuth } from '@/middlewares/auth.middleware';
import { isVendorOwner } from '@/middlewares/isVendorOwner.middleware';
import { validate, validateQuery } from '@/middlewares/validate.middleware';
import { requireRole } from '@/middlewares/role.middleware';
import {
  createProductSchema,
  listProductsQuerySchema,
  rejectProductSchema,
} from './product.validation';
import { ROLE } from '@/generated/prisma/client';

const router = Router();

// === VENDOR ROUTES ===
router.get('/me', isAuth, isVendorOwner, productController.getMyProducts);
router.post(
  '/',
  isAuth,
  isVendorOwner,
  validate(createProductSchema),
  productController.createProduct,
);

// === ADMIN ROUTES === (declared before `/:slug` so they aren't swallowed by it)
router.get(
  '/admin',
  isAuth,
  requireRole(ROLE.ADMIN),
  validateQuery(listProductsQuerySchema),
  productController.getAdminProducts,
);
router.get(
  '/admin/:id',
  isAuth,
  requireRole(ROLE.ADMIN),
  productController.getProductById,
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

// === PUBLIC ROUTES ===
router.get('/', productController.getAllProducts);
router.get('/:slug', productController.getProductBySlug);

export const productRoutes = router;

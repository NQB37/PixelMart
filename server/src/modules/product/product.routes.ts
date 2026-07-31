import { Router } from 'express';
import * as productController from './product.controller';
import { isAuth } from '@/middlewares/auth.middleware';
import { isVendorOwner } from '@/middlewares/isVendorOwner.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { createProductSchema } from './product.validation';

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

// === PUBLIC ROUTES ===
router.get('/', productController.getAllProducts);
router.get('/:slug', productController.getProductBySlug);

export const productRoutes = router;

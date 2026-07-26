import { Router } from 'express';
import * as brandController from './brand.controller';
import { isAuth } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/role.middleware';
import { ROLE } from '@/generated/prisma/enums';
import { validate } from '@/middlewares/validate.middleware';
import { createBrandSchema, updateBrandSchema } from './brand.validation';

const router = Router();

// === PUBLIC ROUTES ===
router.get('/', brandController.getAllBrands);
router.get('/:slug', brandController.getBrandBySlug);

// === ADMIN ROUTES ===
router.post(
  '/',
  isAuth,
  requireRole(ROLE.ADMIN),
  validate(createBrandSchema),
  brandController.createBrand,
);
router.patch(
  '/:id',
  isAuth,
  requireRole(ROLE.ADMIN),
  validate(updateBrandSchema),
  brandController.updateBrand,
);
router.delete(
  '/:id',
  isAuth,
  requireRole(ROLE.ADMIN),
  brandController.deleteBrand,
);

export const brandRoutes = router;

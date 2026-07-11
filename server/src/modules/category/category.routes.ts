import { Router } from 'express';
import * as categoryController from './category.controller';
import { isAuth } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/role.middleware';
import { ROLE } from '@/generated/prisma/enums';

const router = Router();

// === PUBLIC ROUTES ===
router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// === ADMIN ROUTES ===
router.post(
  '/',
  isAuth,
  requireRole(ROLE.ADMIN),
  categoryController.createCategory,
);
router.put(
  '/:id',
  isAuth,
  requireRole(ROLE.ADMIN),
  categoryController.updateCategory,
);
router.delete(
  '/:id',
  isAuth,
  requireRole(ROLE.ADMIN),
  categoryController.deleteCategory,
);

export const categoryRoutes = router;

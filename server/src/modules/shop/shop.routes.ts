import { Router } from 'express';
import * as shopController from './shop.controller';
import { isAuth } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/role.middleware';
import { validate, validateQuery } from '@/middlewares/validate.middleware';
import {
  createShopSchema,
  listShopsQuerySchema,
  rejectShopSchema,
} from './shop.validation';
import { ROLE } from '@/generated/prisma/client';

const router = Router();

// === SELLER ROUTES ===
router.get('/me', isAuth, shopController.getMyShop);
router.post('/', isAuth, validate(createShopSchema), shopController.createShop);

// === ADMIN ROUTES ===
router.get(
  '/',
  isAuth,
  requireRole(ROLE.ADMIN),
  validateQuery(listShopsQuerySchema),
  shopController.getAllShops,
);
router.get('/:id', isAuth, requireRole(ROLE.ADMIN), shopController.getShopById);
router.patch(
  '/:id/approve',
  isAuth,
  requireRole(ROLE.ADMIN),
  shopController.approveShop,
);
router.patch(
  '/:id/reject',
  isAuth,
  requireRole(ROLE.ADMIN),
  validate(rejectShopSchema),
  shopController.rejectShop,
);

export const shopRoutes = router;

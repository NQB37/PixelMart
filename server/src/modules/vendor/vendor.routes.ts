import { Router } from 'express';
import * as vendorController from './vendor.controller';
import { isAuth } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/role.middleware';
import { validate, validateQuery } from '@/middlewares/validate.middleware';
import {
  createVendorSchema,
  listVendorsQuerySchema,
  rejectVendorSchema,
} from './vendor.validation';
import { ROLE } from '@/generated/prisma/client';

const router = Router();

// === VENDOR ROUTES ===
router.get('/me', isAuth, vendorController.getMyVendor);
router.post('/', isAuth, validate(createVendorSchema), vendorController.createVendor);

// === ADMIN ROUTES ===
router.get(
  '/',
  isAuth,
  requireRole(ROLE.ADMIN),
  validateQuery(listVendorsQuerySchema),
  vendorController.getAllVendors,
);
router.get('/:id', isAuth, requireRole(ROLE.ADMIN), vendorController.getVendorById);
router.patch(
  '/:id/approve',
  isAuth,
  requireRole(ROLE.ADMIN),
  vendorController.approveVendor,
);
router.patch(
  '/:id/reject',
  isAuth,
  requireRole(ROLE.ADMIN),
  validate(rejectVendorSchema),
  vendorController.rejectVendor,
);

export const vendorRoutes = router;

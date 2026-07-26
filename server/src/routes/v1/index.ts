import { Router } from 'express';
import { ApiResponse } from '@/utils/ApiResponse';
import { authRoutes } from '@/modules/auth/auth.routes';
import { vendorRoutes } from '@/modules/vendor/vendor.routes';
import { uploadRoutes } from '@/modules/upload/upload.routes';
import { userRoutes } from '@/modules/user/user.routes';
import { categoryRoutes } from '@/modules/category/category.routes';
import { brandRoutes } from '@/modules/brand/brand.routes';

const router: Router = Router();

router.get('/health', (_req, res) => {
  return ApiResponse.success(res, { message: 'OK' });
});

router.use('/auth', authRoutes);
router.use('/vendors', vendorRoutes);
router.use('/uploads', uploadRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);

export { router as routes };

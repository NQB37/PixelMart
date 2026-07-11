import { Router } from 'express';
import { ApiResponse } from '@/utils/ApiResponse';
import { authRoutes } from '@/modules/auth/auth.routes';
import { shopRoutes } from '@/modules/shop/shop.routes';
import { uploadRoutes } from '@/modules/upload/upload.routes';
import { userRoutes } from '@/modules/user/user.routes';
import { categoryRoutes } from '@/modules/category/category.routes';

const router: Router = Router();

router.get('/health', (_req, res) => {
  return ApiResponse.success(res, { message: 'OK' });
});

router.use('/auth', authRoutes);
router.use('/shops', shopRoutes);
router.use('/uploads', uploadRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);

export { router as routes };

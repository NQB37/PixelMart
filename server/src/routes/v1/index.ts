import { Router } from 'express';
import { ApiResponse } from '@/utils/ApiResponse';
import { authRoutes } from '@/modules/auth/auth.routes';
import { shopRoutes } from '@/modules/shop/shop.routes';
import { uploadRoutes } from '@/modules/upload/upload.routes';

const router: Router = Router();

router.get('/health', (_req, res) => {
  return ApiResponse.success(res, { message: 'OK' });
});

router.use('/auth', authRoutes);
router.use('/shops', shopRoutes);
router.use('/uploads', uploadRoutes);

export { router as routes };

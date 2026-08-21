import { Router } from 'express';
import * as uploadController from './upload.controller';
import { isAuth } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { uploadImageSchema } from './upload.validation';
import { uploadSingleImage } from './upload.middleware';

const router = Router();

router.post(
  '/',
  isAuth,
  uploadSingleImage,
  validate(uploadImageSchema),
  uploadController.uploadImage,
);

export const uploadRoutes: Router = router;

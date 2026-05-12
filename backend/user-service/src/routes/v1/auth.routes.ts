import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import {
  loginSchema,
  registerSchema,
} from '../../validators/auth.validator.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  validateRequest(registerSchema),
  authController.register,
);
authRouter.post('/login', validateRequest(loginSchema), authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, authController.me);

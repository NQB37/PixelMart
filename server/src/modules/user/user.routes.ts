import { Router } from 'express';
import * as userController from './user.controller';
import { isAuth } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/role.middleware';
import { validate, validateQuery } from '@/middlewares/validate.middleware';
import { listUsersQuerySchema, updateUserStatusSchema } from './user.validation';
import { ROLE } from '@/generated/prisma/client';

const router = Router();

router.use(isAuth, requireRole(ROLE.ADMIN));

router.get('/', validateQuery(listUsersQuerySchema), userController.listUsers);
router.patch(
  '/:id/status',
  validate(updateUserStatusSchema),
  userController.updateUserStatus,
);
router.patch('/:id/restore', userController.restoreUser);
router.delete('/:id/permanent', userController.permanentlyDeleteUser);
router.delete('/:id', userController.deleteUser);

export const userRoutes: Router = router;

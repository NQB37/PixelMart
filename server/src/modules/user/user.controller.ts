import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/ApiResponse';
import { userService } from './user.service';
import { ListUsersQuery, UpdateUserStatusInput } from './user.validation';

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.validatedQuery as unknown as ListUsersQuery);

  ApiResponse.success(res, result);
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body as UpdateUserStatusInput;
  const user = await userService.updateStatus(
    req.params.id as string,
    isActive,
    req.user!.userId,
  );

  ApiResponse.success(res, user, 'User status updated successfully');
});

export { listUsers, updateUserStatus };

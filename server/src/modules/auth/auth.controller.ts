import { asyncHandler } from '@/utils/asyncHandler';
import { authService } from './auth.service';
import {
  clearTokenCookies,
  getRefreshTokenCookie,
  setRefreshTokenCookie,
} from '@/utils/cookies';
import { ApiResponse } from '@/utils/ApiResponse';
import { ApiError } from '@/utils/ApiError';

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  setRefreshTokenCookie(req, res, result.refreshToken);

  const response = { user: result.user, accessToken: result.accessToken };

  ApiResponse.created(res, response, 'User registered successfully');
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  setRefreshTokenCookie(req, res, result.refreshToken);

  const response = { user: result.user, accessToken: result.accessToken };

  ApiResponse.success(res, response, 'User logged in successfully');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user!.userId);

  ApiResponse.success(res, user, 'Current user fetched successfully');
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshTokenCookie(req);
  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  clearTokenCookies(req, res);

  ApiResponse.success(res, null, 'User logged out successfully');
});

const refreshToken = asyncHandler(async (req, res) => {
  const oldRefreshToken = getRefreshTokenCookie(req);
  if (!oldRefreshToken) {
    throw ApiError.unauthorized('No refresh token provided');
  }

  const result = await authService.refreshToken(oldRefreshToken);

  setRefreshTokenCookie(req, res, result.refreshToken);

  // The user is returned alongside the token so the frontend's cached roles
  // stay in sync with the roles baked into the new access token.
  ApiResponse.success(
    res,
    { accessToken: result.accessToken, user: result.user },
    'Token refreshed successfully',
  );
});

export { register, login, logout, refreshToken, getMe };

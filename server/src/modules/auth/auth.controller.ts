import { asyncHandler } from "@/utils/asyncHandler";
import { authService } from "./auth.service";
import { clearTokenCookies, setRefreshTokenCookie } from "@/utils/cookies";
import { ApiResponse } from "@/utils/ApiResponse";
import { ApiError } from "@/utils/ApiError";

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  setRefreshTokenCookie(res, result.refreshToken);

  const response = { user: result.user, accessToken: result.accessToken };

  ApiResponse.created(res, response, "User registered successfully");
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  setRefreshTokenCookie(res, result.refreshToken);

  const response = { user: result.user, accessToken: result.accessToken };

  ApiResponse.success(res, response, "User logged in successfully");
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  clearTokenCookies(res);

  ApiResponse.success(res, null, "User logged out successfully");
});

const refreshToken = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    throw ApiError.unauthorized("No refresh token provided");
  }

  const tokens = await authService.refreshToken(oldRefreshToken);

  setRefreshTokenCookie(res, tokens.refreshToken);

  ApiResponse.success(
    res,
    { accessToken: tokens.accessToken },
    "Token refreshed successfully",
  );
});

export { register, login, logout, refreshToken };

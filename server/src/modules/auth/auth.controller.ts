import { asyncHandler } from "@/utils/asyncHandler";
import { authService } from "./auth.service";
import { clearTokenCookies, setRefreshTokenCookie } from "@/utils/cookies";
import { ApiResponse } from "@/utils/ApiResponse";

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  setRefreshTokenCookie(res, result.refreshToken);

  ApiResponse.created(res, result.user, "User registered successfully");
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  setRefreshTokenCookie(res, result.refreshToken);

  ApiResponse.success(res, result.user, "User logged in successfully");
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
    throw new Error("No refresh token provided");
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

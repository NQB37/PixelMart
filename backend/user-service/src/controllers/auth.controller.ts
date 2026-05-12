import type { Request, Response } from 'express';
import { NODE_ENV, REFRESH_TOKEN_EXPIRY } from '../config/env.js';
import * as authService from '../services/auth.service.js';
import { AppError } from '../utils/app-error.js';

const REFRESH_COOKIE_NAME = 'refreshToken';

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: NODE_ENV === 'production',
  maxAge: REFRESH_TOKEN_EXPIRY,
  path: '/',
};

const setRefreshCookie = (res: Response, refreshToken: string) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    ...refreshCookieOptions,
    maxAge: undefined,
  });
};

export const register = async (req: Request, res: Response) => {
  const result = await authService.register(req.body);

  setRefreshCookie(res, result.refreshToken);

  return res.status(201).json({
    user: result.user,
    accessToken: result.accessToken,
  });
};

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  setRefreshCookie(res, result.refreshToken);

  return res.json({
    user: result.user,
    accessToken: result.accessToken,
  });
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (!refreshToken) {
    throw new AppError(401, 'Refresh token is required');
  }

  const result = await authService.refresh(refreshToken);

  setRefreshCookie(res, result.refreshToken);

  return res.json({
    accessToken: result.accessToken,
  });
};

export const logout = async (req: Request, res: Response) => {
  await authService.logout(req.cookies?.[REFRESH_COOKIE_NAME]);
  clearRefreshCookie(res);

  return res.status(204).send();
};

export const me = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Access token is required');
  }

  const user = await authService.getCurrentUser(req.user.sub);

  return res.json({
    user,
  });
};

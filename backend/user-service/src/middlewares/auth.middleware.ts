import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../lib/jwt.js';
import { AppError } from '../utils/app-error.js';

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.header('authorization');
  const [scheme, token] = authHeader?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError(401, 'Access token is required'));
  }

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return next(new AppError(401, 'Invalid access token'));
  }
};

import jwt, { type JwtPayload } from 'jsonwebtoken';
import {
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
} from '../config/env.js';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: string;
  status: string;
  type: 'access';
};

export type RefreshTokenPayload = {
  sub: string;
  jti: string;
  type: 'refresh';
};

const toJwtSeconds = (milliseconds: number) => Math.floor(milliseconds / 1000);

export const signAccessToken = (payload: AccessTokenPayload) =>
  jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: toJwtSeconds(ACCESS_TOKEN_EXPIRY),
  });

export const signRefreshToken = (payload: RefreshTokenPayload) =>
  jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: toJwtSeconds(REFRESH_TOKEN_EXPIRY),
  });

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;

  if (payload.type !== 'access' || typeof payload.sub !== 'string') {
    throw new Error('Invalid access token');
  }

  return payload as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;

  if (
    payload.type !== 'refresh' ||
    typeof payload.sub !== 'string' ||
    typeof payload.jti !== 'string'
  ) {
    throw new Error('Invalid refresh token');
  }

  return payload as RefreshTokenPayload;
};

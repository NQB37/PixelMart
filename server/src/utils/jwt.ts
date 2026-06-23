import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { ApiError } from "./ApiError";

export interface JwtPayload {
  userId: string;
  email: string;
}

const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, env.jwtAccessSecret!, {
    expiresIn: env.accessTokenExpiresIn as any,
  });
};

const generateRefreshToken = (payload: JwtPayload) => {
  return jwt.sign(payload, env.jwtRefreshSecret!, {
    expiresIn: env.refreshTokenExpiresIn as any,
  });
};

const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, env.jwtAccessSecret!) as JwtPayload;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        throw ApiError.unauthorized("Access token is expired");
      }

      if (error.name === "JsonWebTokenError") {
        throw ApiError.unauthorized("Invalid access token");
      }
    }

    throw error;
  }
};

const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, env.jwtRefreshSecret!) as JwtPayload;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        throw ApiError.unauthorized("Refresh token is expired");
      }

      if (error.name === "JsonWebTokenError") {
        throw ApiError.unauthorized("Invalid refresh token");
      }
    }

    throw error;
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

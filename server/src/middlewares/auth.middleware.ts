import { ApiError } from "@/utils/ApiError";
import { verifyAccessToken } from "@/utils/jwt";
import { NextFunction, Request, Response } from "express";

const isAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Get token from cookie or header
    const token =
      req.cookies.access_token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw ApiError.unauthorized("Please login");
    }

    // Verify token
    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    next(ApiError.unauthorized("Token is invalid or expired"));
  }
};

export { isAuth };

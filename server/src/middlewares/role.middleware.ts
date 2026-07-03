import { ApiError } from "@/utils/ApiError";
import { ROLE } from "@/generated/prisma/client";
import { NextFunction, Request, Response } from "express";

const requireRole = (...allowedRoles: ROLE[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const roles = req.user?.roles ?? [];
    const hasRole = roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return next(ApiError.forbidden("You don't have permission to access this resource"));
    }

    next();
  };
};

export { requireRole };

import { Response } from "express";
import { env } from "@/config/env";

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth",
  });
};

const clearTokenCookies = (res: Response) => {
  res.clearCookie("refreshToken", { path: "/api/v1/auth" });
};

export { setRefreshTokenCookie, clearTokenCookies };

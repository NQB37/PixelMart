import { Request, Response } from "express";
import { env } from "@/config/env";

const COOKIE_PATH = "/api/v1/auth";

/**
 * Cookies ignore the port, so on localhost the three portals would otherwise
 * share one `refreshToken` cookie: logging in on one app silently hijacks the
 * others' session and their next refresh returns a token for the wrong user.
 * Naming the cookie per origin keeps the sessions independent.
 */
const aliasedOrigins = (url: string | undefined, name: string) =>
  url ? { [url]: name, [url.replace("localhost", "127.0.0.1")]: name } : {};

const cookieNameByOrigin: Record<string, string> = {
  ...aliasedOrigins(env.adminWebUrl, "refreshToken_admin"),
  ...aliasedOrigins(env.vendorWebUrl, "refreshToken_vendor"),
};

const refreshTokenCookieName = (req: Request) =>
  cookieNameByOrigin[req.headers.origin ?? ""] ?? "refreshToken";

const setRefreshTokenCookie = (
  req: Request,
  res: Response,
  refreshToken: string,
) => {
  res.cookie(refreshTokenCookieName(req), refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
    path: COOKIE_PATH,
  });
};

const getRefreshTokenCookie = (req: Request): string | undefined =>
  req.cookies[refreshTokenCookieName(req)];

const clearTokenCookies = (req: Request, res: Response) => {
  res.clearCookie(refreshTokenCookieName(req), { path: COOKIE_PATH });
};

export { setRefreshTokenCookie, getRefreshTokenCookie, clearTokenCookies };

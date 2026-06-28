import { Response } from "express";
import { Tokens } from "./auth.types";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

// Must track the JWT TTLs (JWT_ACCESS_TTL=15m, JWT_REFRESH_TTL=7d).
const ACCESS_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function baseOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure, // true over HTTPS in production
    sameSite: "lax" as const,
    path: "/",
  };
}

export function setAuthCookies(res: Response, tokens: Tokens, secure: boolean): void {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...baseOptions(secure),
    maxAge: ACCESS_MAX_AGE_MS,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseOptions(secure),
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { path: "/" });
  res.clearCookie(REFRESH_COOKIE, { path: "/" });
}

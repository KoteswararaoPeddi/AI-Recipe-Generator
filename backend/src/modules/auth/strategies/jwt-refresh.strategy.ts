import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AppConfig } from "../../../config/config.types";
import { JwtPayload, RefreshRequestUser } from "../auth.types";

/** Reads the refresh token from the HTTP-only `refresh_token` cookie. */
const refreshCookieExtractor = (req: Request): string | null => {
  return (req?.cookies?.refresh_token as string | undefined) ?? null;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(config: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([refreshCookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: config.get("jwt", { infer: true }).refreshSecret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): RefreshRequestUser {
    const refreshToken = refreshCookieExtractor(req);
    if (!refreshToken) {
      throw new UnauthorizedException("Missing refresh token.");
    }
    return { id: payload.sub, email: payload.email, refreshToken };
  }
}

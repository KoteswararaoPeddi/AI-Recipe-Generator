import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AppConfig } from "../../../config/config.types";
import { AuthUser } from "../../../common/decorators/current-user.decorator";
import { JwtPayload } from "../auth.types";

/** Reads the access token from the HTTP-only `access_token` cookie. */
const cookieExtractor = (req: Request): string | null => {
  return (req?.cookies?.access_token as string | undefined) ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(config: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: config.get("jwt", { infer: true }).accessSecret,
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return { id: payload.sub, email: payload.email };
  }
}

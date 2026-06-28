import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Guards the /auth/refresh route only. Validates the refresh-token JWT from the cookie
 * (passport "jwt-refresh" strategy) and attaches the user + raw refresh token to the request.
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard("jwt-refresh") {}

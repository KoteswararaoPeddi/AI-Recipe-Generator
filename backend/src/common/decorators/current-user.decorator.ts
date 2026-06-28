import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Pulls the authenticated user (set by JwtStrategy) off the request. The userId therefore
 * comes from the verified JWT, never from a client-supplied value.
 *
 *   me(@CurrentUser() user: AuthUser) { ... }
 *   list(@CurrentUser("id") userId: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | string => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    const user = request.user;
    return field ? user[field] : user;
  },
);

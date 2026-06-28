import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/**
 * Marks a route as public so the global JwtAuthGuard skips it. The app is secure-by-default:
 * only the few public routes (register/login/refresh, health) carry this decorator.
 */
export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC_KEY, true);

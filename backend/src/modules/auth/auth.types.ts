export interface JwtPayload {
  sub: string; // user id
  email: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/** Request user attached by JwtRefreshStrategy — carries the raw refresh token for rotation. */
export interface RefreshRequestUser {
  id: string;
  email: string;
  refreshToken: string;
}

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { createHash } from "crypto";
import * as bcrypt from "bcryptjs";

import { AppConfig } from "../../config/config.types";
import { SafeUser, UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtPayload, Tokens } from "./auth.types";

const BCRYPT_ROUNDS = 12;

export interface AuthResult {
  user: SafeUser;
  tokens: Tokens;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("An account with that email already exists.");
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.users.create(dto.email, passwordHash);
    const tokens = await this.issueTokens(user.id, user.email);
    return { user, tokens };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password.");
    }
    const tokens = await this.issueTokens(user.id, user.email);
    return {
      user: { id: user.id, email: user.email, createdAt: user.createdAt },
      tokens,
    };
  }

  /** Validates the presented refresh token against the stored hash, then rotates the pair. */
  async refresh(userId: string, presentedRefreshToken: string): Promise<AuthResult> {
    const user = await this.users.findById(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException("Access denied.");
    }
    const matches = await bcrypt.compare(
      this.digest(presentedRefreshToken),
      user.hashedRefreshToken,
    );
    if (!matches) {
      throw new ForbiddenException("Access denied.");
    }
    const tokens = await this.issueTokens(user.id, user.email);
    return {
      user: { id: user.id, email: user.email, createdAt: user.createdAt },
      tokens,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.users.setRefreshTokenHash(userId, null);
  }

  me(userId: string): Promise<SafeUser | null> {
    return this.users.findSafeById(userId);
  }

  /** Signs a new access + refresh pair and persists the (hashed) refresh token. */
  private async issueTokens(userId: string, email: string): Promise<Tokens> {
    const cfg = this.config.get("jwt", { infer: true });
    const payload: JwtPayload = { sub: userId, email };

    const accessOptions: JwtSignOptions = {
      secret: cfg.accessSecret,
      expiresIn: cfg.accessTtl as JwtSignOptions["expiresIn"],
    };
    const refreshOptions: JwtSignOptions = {
      secret: cfg.refreshSecret,
      expiresIn: cfg.refreshTtl as JwtSignOptions["expiresIn"],
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, accessOptions),
      this.jwt.signAsync(payload, refreshOptions),
    ]);

    const hashed = await bcrypt.hash(this.digest(refreshToken), BCRYPT_ROUNDS);
    await this.users.setRefreshTokenHash(userId, hashed);

    return { accessToken, refreshToken };
  }

  /** SHA-256 first so the (long) JWT isn't silently truncated by bcrypt's 72-byte limit. */
  private digest(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}

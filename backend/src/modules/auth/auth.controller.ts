import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";

import { AppConfig } from "../../config/config.types";
import { AuthUser, CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { JwtRefreshGuard } from "../../common/guards/jwt-refresh.guard";
import { AuthService } from "./auth.service";
import { clearAuthCookies, setAuthCookies } from "./auth.cookies";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshRequestUser } from "./auth.types";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  private get secure(): boolean {
    return this.config.get("nodeEnv", { infer: true }) === "production";
  }

  @Public()
  @ApiOperation({ summary: "Register a new account", description: "Creates the user + default preferences and sets the auth cookies." })
  @ApiResponse({ status: 201, description: "Account created" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 409, description: "Email already in use" })
  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.auth.register(dto);
    setAuthCookies(res, tokens, this.secure);
    return { message: "Account created", data: user };
  }

  @Public()
  @ApiOperation({ summary: "Log in", description: "Verifies credentials and sets the auth cookies." })
  @ApiResponse({ status: 200, description: "Logged in" })
  @ApiResponse({ status: 401, description: "Invalid email or password" })
  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.auth.login(dto);
    setAuthCookies(res, tokens, this.secure);
    return { message: "Logged in", data: user };
  }

  @Public()
  @ApiOperation({ summary: "Rotate tokens", description: "Reads the refresh_token cookie, validates + rotates it, and replaces both cookies." })
  @ApiResponse({ status: 200, description: "Token refreshed" })
  @ApiResponse({ status: 403, description: "Invalid/expired or reused refresh token" })
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post("refresh")
  async refresh(
    @CurrentUser() user: RefreshRequestUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user: safeUser, tokens } = await this.auth.refresh(user.id, user.refreshToken);
    setAuthCookies(res, tokens, this.secure);
    return { message: "Token refreshed", data: safeUser };
  }

  @ApiCookieAuth("access_token")
  @ApiOperation({ summary: "Log out", description: "Clears the auth cookies and invalidates the stored refresh token." })
  @ApiResponse({ status: 200, description: "Logged out" })
  @ApiResponse({ status: 401, description: "Not authenticated" })
  @HttpCode(HttpStatus.OK)
  @Post("logout")
  async logout(
    @CurrentUser("id") userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(userId);
    clearAuthCookies(res);
    return { message: "Logged out", data: null };
  }

  @ApiCookieAuth("access_token")
  @ApiOperation({ summary: "Current user", description: "Returns the authenticated user (from the access-token cookie)." })
  @ApiResponse({ status: 200, description: "Current user" })
  @ApiResponse({ status: 401, description: "Not authenticated" })
  @Get("me")
  async me(@CurrentUser("id") userId: string) {
    return { message: "Current user", data: await this.auth.me(userId) };
  }
}

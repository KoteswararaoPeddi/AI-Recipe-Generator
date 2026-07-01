import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { User } from "@prisma/client";
import * as bcrypt from "bcryptjs";

import { PrismaService } from "../../prisma/prisma.service";

const BCRYPT_ROUNDS = 12;

/** The user fields safe to return to clients — never passwordHash / hashedRefreshToken. */
export const SAFE_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
} as const;

export type SafeUser = Pick<User, "id" | "email" | "name" | "createdAt">;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Full row (incl. hashes) — for auth checks only, never returned to a client. */
  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findSafeById(id: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });
  }

  /** Creates the user and its default (empty) preferences in one go. */
  create(email: string, passwordHash: string): Promise<SafeUser> {
    return this.prisma.user.create({
      data: { email, passwordHash, preference: { create: {} } },
      select: SAFE_USER_SELECT,
    });
  }

  setRefreshTokenHash(id: string, hashedRefreshToken: string | null): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { hashedRefreshToken },
    });
  }

  /** Updates the editable profile fields. Email uniqueness is enforced by the DB (→ 409). */
  updateProfile(
    id: string,
    data: { name?: string; email?: string },
  ): Promise<SafeUser> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: SAFE_USER_SELECT,
    });
  }

  /** Verifies the current password before setting a new hash. */
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new UnauthorizedException("Not authenticated.");
    }
    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      throw new BadRequestException("Current password is incorrect.");
    }
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }
}

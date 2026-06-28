import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

/** The user fields safe to return to clients — never passwordHash / hashedRefreshToken. */
export const SAFE_USER_SELECT = {
  id: true,
  email: true,
  createdAt: true,
} as const;

export type SafeUser = Pick<User, "id" | "email" | "createdAt">;

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
}

import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({ example: "current-password" })
  @IsString()
  @MinLength(1, { message: "Current password is required." })
  currentPassword!: string;

  // bcrypt only hashes the first 72 bytes — cap length so longer passwords aren't silently truncated.
  @ApiProperty({ example: "new-password123", minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters." })
  @MaxLength(72, { message: "Password must be at most 72 characters." })
  newPassword!: string;
}

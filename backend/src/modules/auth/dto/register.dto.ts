import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "cook@pantry.test", format: "email" })
  @IsEmail({}, { message: "Enter a valid email address." })
  email!: string;

  // bcrypt only hashes the first 72 bytes — cap length so longer passwords aren't silently truncated.
  @ApiProperty({ example: "password123", minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters." })
  @MaxLength(72, { message: "Password must be at most 72 characters." })
  password!: string;
}

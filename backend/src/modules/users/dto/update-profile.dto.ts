import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "Alex" })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: "Name cannot be empty." })
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional({ example: "alex@pantry.test", format: "email" })
  @IsOptional()
  @IsEmail({}, { message: "Enter a valid email address." })
  email?: string;
}

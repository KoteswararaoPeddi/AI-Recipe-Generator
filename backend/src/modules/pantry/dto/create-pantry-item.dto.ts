import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreatePantryItemDto {
  @ApiProperty({ example: "Tomatoes" })
  @IsString()
  @MinLength(1, { message: "Name is required." })
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: "Vegetables" })
  @IsString()
  @MinLength(1)
  category!: string;

  @ApiProperty({ example: 3, minimum: 0 })
  @IsNumber()
  @Min(0, { message: "Quantity must be 0 or more." })
  quantity!: number;

  @ApiProperty({ example: "Pieces" })
  @IsString()
  @MinLength(1)
  unit!: string;

  @ApiPropertyOptional({ example: "2026-07-15", description: "ISO date (yyyy-mm-dd)" })
  @IsOptional()
  @IsDateString({}, { message: "Expiry must be a valid date." })
  expiryDate?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  runningLow?: boolean;
}

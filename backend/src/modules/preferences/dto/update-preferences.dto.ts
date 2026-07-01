import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsIn,
  IsInt,
  IsString,
  Max,
  Min,
} from "class-validator";

export class UpdatePreferencesDto {
  @ApiProperty({ example: ["Vegetarian", "Gluten-Free"], type: [String] })
  @IsArray()
  @IsString({ each: true })
  dietaryRestrictions!: string[];

  @ApiProperty({ example: "peanuts, shellfish" })
  @IsString()
  allergies!: string;

  @ApiProperty({ example: "Mexican" })
  @IsString()
  preferredCuisine!: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  defaultServings!: number;

  @ApiProperty({ example: "metric", enum: ["metric", "imperial"] })
  @IsIn(["metric", "imperial"], { message: "Measurement unit must be metric or imperial." })
  measurementUnit!: string;
}

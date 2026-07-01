import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsString,
  Max,
  Min,
} from "class-validator";

export class GenerateRecipeDto {
  @ApiProperty({ example: ["chicken", "bell peppers", "onion"], type: [String] })
  @IsArray()
  @IsString({ each: true })
  ingredients!: string[];

  @ApiProperty({ example: true, description: "Also use the user's pantry items." })
  @IsBoolean()
  usePantry!: boolean;

  @ApiProperty({ example: "Mexican" })
  @IsString()
  cuisine!: string;

  @ApiProperty({ example: ["Vegetarian"], type: [String] })
  @IsArray()
  @IsString({ each: true })
  diets!: string[];

  @ApiProperty({ example: 4, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  servings!: number;

  @ApiProperty({ example: "quick", enum: ["quick", "medium", "long"] })
  @IsString()
  cookingTime!: string;
}

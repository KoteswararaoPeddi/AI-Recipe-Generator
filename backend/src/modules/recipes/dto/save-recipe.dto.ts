import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

class IngredientDto {
  @ApiProperty({ example: "1.5 pounds" })
  @IsString()
  amount!: string;

  @ApiProperty({ example: "Chicken breast" })
  @IsString()
  name!: string;
}

class NutritionDto {
  @ApiProperty({ example: 290 })
  @IsNumber()
  calories!: number;

  @ApiProperty({ example: 34 })
  @IsNumber()
  protein!: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  carbs!: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  fats!: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  fiber!: number;
}

export class SaveRecipeDto {
  @ApiProperty({ example: "Quick Chicken Fajita Skillet" })
  @IsString()
  @MinLength(1, { message: "Title is required." })
  title!: string;

  @ApiProperty({ example: "A vibrant Mexican-inspired skillet dish." })
  @IsString()
  description!: string;

  @ApiProperty({ example: "Mexican" })
  @IsString()
  cuisine!: string;

  @ApiProperty({ example: "Easy" })
  @IsString()
  difficulty!: string;

  @ApiProperty({ example: "High Protein" })
  @IsString()
  diet!: string;

  @ApiPropertyOptional({ example: ["High Protein", "Gluten-Free"], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietTags?: string[];

  @ApiProperty({ example: 28, minimum: 0 })
  @IsInt()
  @Min(0)
  minutes!: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(0)
  prepMinutes?: number;

  @ApiPropertyOptional({ example: 16 })
  @IsOptional()
  @IsInt()
  @Min(0)
  cookMinutes?: number;

  @ApiProperty({ example: 4, minimum: 1 })
  @IsInt()
  @Min(1)
  servings!: number;

  @ApiProperty({ type: [IngredientDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients!: IngredientDto[];

  @ApiProperty({ example: ["Slice the chicken.", "Sear in a hot skillet."], type: [String] })
  @IsArray()
  @IsString({ each: true })
  steps!: string[];

  @ApiProperty({ type: NutritionDto })
  @ValidateNested()
  @Type(() => NutritionDto)
  nutrition!: NutritionDto;

  @ApiProperty({ example: ["Slice the chicken against the grain."], type: [String] })
  @IsArray()
  @IsString({ each: true })
  tips!: string[];
}

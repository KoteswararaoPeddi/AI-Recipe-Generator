import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsIn, IsString } from "class-validator";

export class UpsertMealEntryDto {
  @ApiProperty({ example: "2026-02-09", description: "ISO date (yyyy-mm-dd)" })
  @IsDateString({}, { message: "Date must be a valid date." })
  date!: string;

  @ApiProperty({ example: "Breakfast", enum: ["Breakfast", "Lunch", "Dinner"] })
  @IsIn(["Breakfast", "Lunch", "Dinner"], { message: "Slot must be Breakfast, Lunch or Dinner." })
  slot!: string;

  @ApiProperty({ example: "cmqxwhse100030jg8mbv1ld5z" })
  @IsString()
  recipeId!: string;
}

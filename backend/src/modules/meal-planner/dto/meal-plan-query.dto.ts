import { ApiProperty } from "@nestjs/swagger";
import { IsDateString } from "class-validator";

export class MealPlanQueryDto {
  @ApiProperty({ example: "2026-02-08", description: "Week start (inclusive, yyyy-mm-dd)" })
  @IsDateString({}, { message: "weekStart must be a valid date." })
  weekStart!: string;

  @ApiProperty({ example: "2026-02-14", description: "Week end (inclusive, yyyy-mm-dd)" })
  @IsDateString({}, { message: "weekEnd must be a valid date." })
  weekEnd!: string;
}

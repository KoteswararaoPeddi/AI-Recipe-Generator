import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { MealPlanQueryDto } from "./dto/meal-plan-query.dto";
import { UpsertMealEntryDto } from "./dto/upsert-meal-entry.dto";
import { MealPlannerService } from "./meal-planner.service";

@ApiTags("Meal Planner")
@ApiCookieAuth("access_token")
@Controller("meal-plan")
export class MealPlannerController {
  constructor(private readonly mealPlanner: MealPlannerService) {}

  @ApiOperation({ summary: "List meals for a week", description: "Entries between weekStart and weekEnd (inclusive)." })
  @ApiResponse({ status: 200, description: "Meal plan entries" })
  @Get()
  async list(@CurrentUser("id") userId: string, @Query() query: MealPlanQueryDto) {
    return { message: "Meal plan", data: await this.mealPlanner.list(userId, query) };
  }

  @ApiOperation({ summary: "Assign a recipe to a slot", description: "Upserts the (date, slot) entry." })
  @ApiResponse({ status: 201, description: "Meal assigned" })
  @ApiResponse({ status: 400, description: "Recipe not found" })
  @Post()
  async upsert(@CurrentUser("id") userId: string, @Body() dto: UpsertMealEntryDto) {
    return { message: "Meal assigned", data: await this.mealPlanner.upsert(userId, dto) };
  }

  @ApiOperation({ summary: "Remove a planned meal" })
  @ApiResponse({ status: 200, description: "Meal removed" })
  @ApiResponse({ status: 404, description: "Entry not found" })
  @HttpCode(HttpStatus.OK)
  @Delete(":id")
  async remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    await this.mealPlanner.remove(userId, id);
    return { message: "Meal removed", data: null };
  }
}

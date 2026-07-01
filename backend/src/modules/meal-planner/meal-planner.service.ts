import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MealPlanEntry, Recipe } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { SLOT_TO_LABEL, labelToSlot } from "../../common/enums/enum-maps";
import { recipeToView, RecipeView } from "../recipes/recipe.mapper";
import { MealPlanQueryDto } from "./dto/meal-plan-query.dto";
import { UpsertMealEntryDto } from "./dto/upsert-meal-entry.dto";

/** A planned meal: the slot plus the full recipe so the grid can render it directly. */
export interface MealEntryView {
  id: string;
  date: string;
  slot: string;
  recipe: RecipeView;
}

function toView(entry: MealPlanEntry & { recipe: Recipe }): MealEntryView {
  return {
    id: entry.id,
    date: entry.date.toISOString().slice(0, 10),
    slot: SLOT_TO_LABEL[entry.slot],
    recipe: recipeToView(entry.recipe),
  };
}

@Injectable()
export class MealPlannerService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: MealPlanQueryDto): Promise<MealEntryView[]> {
    const entries = await this.prisma.mealPlanEntry.findMany({
      where: {
        userId,
        date: { gte: new Date(query.weekStart), lte: new Date(query.weekEnd) },
      },
      include: { recipe: true },
      orderBy: { date: "asc" },
    });
    return entries.map(toView);
  }

  /** Assigns a saved recipe to a (date, slot), replacing any existing entry there. */
  async upsert(userId: string, dto: UpsertMealEntryDto): Promise<MealEntryView> {
    const owned = await this.prisma.recipe.findFirst({
      where: { id: dto.recipeId, userId },
      select: { id: true },
    });
    if (!owned) {
      throw new BadRequestException("Recipe not found.");
    }

    const date = new Date(dto.date);
    const slot = labelToSlot(dto.slot);

    const entry = await this.prisma.mealPlanEntry.upsert({
      where: { userId_date_slot: { userId, date, slot } },
      create: { userId, date, slot, recipeId: dto.recipeId },
      update: { recipeId: dto.recipeId },
      include: { recipe: true },
    });
    return toView(entry);
  }

  async remove(userId: string, id: string): Promise<void> {
    const { count } = await this.prisma.mealPlanEntry.deleteMany({ where: { id, userId } });
    if (count === 0) {
      throw new NotFoundException("Meal plan entry not found.");
    }
  }
}

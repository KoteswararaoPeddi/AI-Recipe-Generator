import { Injectable } from "@nestjs/common";
import { Preference } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { CUISINE_TO_LABEL, labelToCuisine } from "../../common/enums/enum-maps";
import { UpdatePreferencesDto } from "./dto/update-preferences.dto";

/** The preferences shape returned to the client (enums rendered as labels). */
export interface PreferencesView {
  dietaryRestrictions: string[];
  allergies: string;
  preferredCuisine: string;
  defaultServings: number;
  measurementUnit: string;
}

@Injectable()
export class PreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Find-or-create the user's single preferences row, then return the view. */
  async get(userId: string): Promise<PreferencesView> {
    const pref = await this.prisma.preference.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    return this.toView(pref);
  }

  async update(userId: string, dto: UpdatePreferencesDto): Promise<PreferencesView> {
    const data = {
      dietaryRestrictions: dto.dietaryRestrictions,
      allergies: dto.allergies,
      preferredCuisine: labelToCuisine(dto.preferredCuisine),
      defaultServings: dto.defaultServings,
      measurementUnit: dto.measurementUnit,
    };
    const pref = await this.prisma.preference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    return this.toView(pref);
  }

  private toView(pref: Preference): PreferencesView {
    return {
      dietaryRestrictions: pref.dietaryRestrictions,
      allergies: pref.allergies,
      preferredCuisine: CUISINE_TO_LABEL[pref.preferredCuisine],
      defaultServings: pref.defaultServings,
      measurementUnit: pref.measurementUnit,
    };
  }
}

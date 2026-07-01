import { Body, Controller, Get, Put } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UpdatePreferencesDto } from "./dto/update-preferences.dto";
import { PreferencesService } from "./preferences.service";

@ApiTags("Preferences")
@ApiCookieAuth("access_token")
@Controller("preferences")
export class PreferencesController {
  constructor(private readonly preferences: PreferencesService) {}

  @ApiOperation({ summary: "Get preferences", description: "The current user's dietary + generator preferences." })
  @ApiResponse({ status: 200, description: "Preferences" })
  @Get()
  async get(@CurrentUser("id") userId: string) {
    return { message: "Preferences", data: await this.preferences.get(userId) };
  }

  @ApiOperation({ summary: "Update preferences", description: "Replaces the current user's preferences." })
  @ApiResponse({ status: 200, description: "Preferences updated" })
  @Put()
  async update(
    @CurrentUser("id") userId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return { message: "Preferences updated", data: await this.preferences.update(userId, dto) };
  }
}

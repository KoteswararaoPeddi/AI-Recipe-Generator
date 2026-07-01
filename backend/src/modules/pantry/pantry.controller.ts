import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CreatePantryItemDto } from "./dto/create-pantry-item.dto";
import { UpdatePantryItemDto } from "./dto/update-pantry-item.dto";
import { PantryService } from "./pantry.service";

@ApiTags("Pantry")
@ApiCookieAuth("access_token")
@Controller("pantry")
export class PantryController {
  constructor(private readonly pantry: PantryService) {}

  @ApiOperation({ summary: "List pantry items" })
  @ApiResponse({ status: 200, description: "Pantry items" })
  @Get()
  async list(@CurrentUser("id") userId: string) {
    return { message: "Pantry items", data: await this.pantry.list(userId) };
  }

  @ApiOperation({ summary: "Add a pantry item" })
  @ApiResponse({ status: 201, description: "Item added" })
  @Post()
  async create(@CurrentUser("id") userId: string, @Body() dto: CreatePantryItemDto) {
    return { message: "Item added", data: await this.pantry.create(userId, dto) };
  }

  @ApiOperation({ summary: "Update a pantry item" })
  @ApiResponse({ status: 200, description: "Item updated" })
  @ApiResponse({ status: 404, description: "Item not found" })
  @Patch(":id")
  async update(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body() dto: UpdatePantryItemDto,
  ) {
    return { message: "Item updated", data: await this.pantry.update(userId, id, dto) };
  }

  @ApiOperation({ summary: "Delete a pantry item" })
  @ApiResponse({ status: 200, description: "Item deleted" })
  @ApiResponse({ status: 404, description: "Item not found" })
  @HttpCode(HttpStatus.OK)
  @Delete(":id")
  async remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    await this.pantry.remove(userId, id);
    return { message: "Item deleted", data: null };
  }
}

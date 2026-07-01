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
import { CreateShoppingItemDto } from "./dto/create-shopping-item.dto";
import { UpdateShoppingItemDto } from "./dto/update-shopping-item.dto";
import { ShoppingService } from "./shopping.service";

@ApiTags("Shopping")
@ApiCookieAuth("access_token")
@Controller("shopping")
export class ShoppingController {
  constructor(private readonly shopping: ShoppingService) {}

  @ApiOperation({ summary: "List shopping items" })
  @ApiResponse({ status: 200, description: "Shopping items" })
  @Get()
  async list(@CurrentUser("id") userId: string) {
    return { message: "Shopping items", data: await this.shopping.list(userId) };
  }

  @ApiOperation({ summary: "Add a shopping item" })
  @ApiResponse({ status: 201, description: "Item added" })
  @Post()
  async create(@CurrentUser("id") userId: string, @Body() dto: CreateShoppingItemDto) {
    return { message: "Item added", data: await this.shopping.create(userId, dto) };
  }

  @ApiOperation({ summary: "Update a shopping item", description: "Toggle checked, rename, etc." })
  @ApiResponse({ status: 200, description: "Item updated" })
  @ApiResponse({ status: 404, description: "Item not found" })
  @Patch(":id")
  async update(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body() dto: UpdateShoppingItemDto,
  ) {
    return { message: "Item updated", data: await this.shopping.update(userId, id, dto) };
  }

  @ApiOperation({ summary: "Move an item to the pantry", description: "Creates a pantry item and removes the list item." })
  @ApiResponse({ status: 200, description: "Moved to pantry" })
  @ApiResponse({ status: 404, description: "Item not found" })
  @HttpCode(HttpStatus.OK)
  @Post(":id/to-pantry")
  async toPantry(@CurrentUser("id") userId: string, @Param("id") id: string) {
    await this.shopping.promoteToPantry(userId, id);
    return { message: "Moved to pantry", data: null };
  }

  @ApiOperation({ summary: "Delete a shopping item" })
  @ApiResponse({ status: 200, description: "Item deleted" })
  @ApiResponse({ status: 404, description: "Item not found" })
  @HttpCode(HttpStatus.OK)
  @Delete(":id")
  async remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    await this.shopping.remove(userId, id);
    return { message: "Item deleted", data: null };
  }
}

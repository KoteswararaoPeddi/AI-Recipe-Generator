import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

import { CreateShoppingItemDto } from "./create-shopping-item.dto";

export class UpdateShoppingItemDto extends PartialType(CreateShoppingItemDto) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  checked?: boolean;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Min, MinLength } from "class-validator";

export class CreateShoppingItemDto {
  @ApiProperty({ example: "Milk" })
  @IsString()
  @MinLength(1, { message: "Name is required." })
  name!: string;

  @ApiProperty({ example: "Dairy" })
  @IsString()
  @MinLength(1)
  category!: string;

  @ApiProperty({ example: 1, minimum: 0 })
  @IsNumber()
  @Min(0, { message: "Quantity must be 0 or more." })
  quantity!: number;

  @ApiProperty({ example: "liters" })
  @IsString()
  @MinLength(1)
  unit!: string;
}

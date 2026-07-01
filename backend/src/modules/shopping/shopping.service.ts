import { Injectable, NotFoundException } from "@nestjs/common";
import { ShoppingItem } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { CreateShoppingItemDto } from "./dto/create-shopping-item.dto";
import { UpdateShoppingItemDto } from "./dto/update-shopping-item.dto";

export interface ShoppingItemView {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

function toView(item: ShoppingItem): ShoppingItemView {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    checked: item.checked,
  };
}

@Injectable()
export class ShoppingService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<ShoppingItemView[]> {
    const items = await this.prisma.shoppingItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return items.map(toView);
  }

  async create(userId: string, dto: CreateShoppingItemDto): Promise<ShoppingItemView> {
    const item = await this.prisma.shoppingItem.create({
      data: {
        userId,
        name: dto.name,
        category: dto.category,
        quantity: dto.quantity,
        unit: dto.unit,
      },
    });
    return toView(item);
  }

  async update(userId: string, id: string, dto: UpdateShoppingItemDto): Promise<ShoppingItemView> {
    await this.ensureOwned(userId, id);
    const item = await this.prisma.shoppingItem.update({ where: { id }, data: dto });
    return toView(item);
  }

  async remove(userId: string, id: string): Promise<void> {
    const { count } = await this.prisma.shoppingItem.deleteMany({ where: { id, userId } });
    if (count === 0) {
      throw new NotFoundException("Shopping item not found.");
    }
  }

  /** Moves a bought item into the pantry: create the pantry row + delete the list row atomically. */
  async promoteToPantry(userId: string, id: string): Promise<void> {
    const item = await this.prisma.shoppingItem.findFirst({ where: { id, userId } });
    if (!item) {
      throw new NotFoundException("Shopping item not found.");
    }
    await this.prisma.$transaction([
      this.prisma.pantryItem.create({
        data: {
          userId,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          runningLow: false,
        },
      }),
      this.prisma.shoppingItem.delete({ where: { id } }),
    ]);
  }

  private async ensureOwned(userId: string, id: string): Promise<void> {
    const found = await this.prisma.shoppingItem.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException("Shopping item not found.");
    }
  }
}

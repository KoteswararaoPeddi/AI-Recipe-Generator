import { Injectable, NotFoundException } from "@nestjs/common";
import { PantryItem, Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { CreatePantryItemDto } from "./dto/create-pantry-item.dto";
import { UpdatePantryItemDto } from "./dto/update-pantry-item.dto";

/** Client-facing pantry item (expiry as an ISO date string, never a Date object). */
export interface PantryItemView {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  runningLow: boolean;
}

function toView(item: PantryItem): PantryItemView {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    expiryDate: item.expiryDate ? item.expiryDate.toISOString().slice(0, 10) : undefined,
    runningLow: item.runningLow,
  };
}

@Injectable()
export class PantryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<PantryItemView[]> {
    const items = await this.prisma.pantryItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return items.map(toView);
  }

  async create(userId: string, dto: CreatePantryItemDto): Promise<PantryItemView> {
    const item = await this.prisma.pantryItem.create({
      data: {
        userId,
        name: dto.name,
        category: dto.category,
        quantity: dto.quantity,
        unit: dto.unit,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        runningLow: dto.runningLow ?? false,
      },
    });
    return toView(item);
  }

  async update(userId: string, id: string, dto: UpdatePantryItemDto): Promise<PantryItemView> {
    await this.ensureOwned(userId, id);

    const data: Prisma.PantryItemUpdateInput = {
      name: dto.name,
      category: dto.category,
      quantity: dto.quantity,
      unit: dto.unit,
      runningLow: dto.runningLow,
    };
    // Only touch expiryDate when the client actually sent the field.
    if (dto.expiryDate !== undefined) {
      data.expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : null;
    }

    const item = await this.prisma.pantryItem.update({ where: { id }, data });
    return toView(item);
  }

  async remove(userId: string, id: string): Promise<void> {
    const { count } = await this.prisma.pantryItem.deleteMany({ where: { id, userId } });
    if (count === 0) {
      throw new NotFoundException("Pantry item not found.");
    }
  }

  /** Guards that the row belongs to the caller before an update by unique id. */
  private async ensureOwned(userId: string, id: string): Promise<void> {
    const found = await this.prisma.pantryItem.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException("Pantry item not found.");
    }
  }
}

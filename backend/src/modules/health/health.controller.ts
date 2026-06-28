import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { PrismaService } from "../../prisma/prisma.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @ApiOperation({ summary: "Health check", description: "Liveness + DB connectivity." })
  @Get()
  async check(): Promise<{ message: string; data: { status: string; db: string } }> {
    let db = "up";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      db = "down";
    }
    return { message: "PantryChef API is running", data: { status: "ok", db } };
  }
}

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthController } from "./health/health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // Feature modules (auth, pantry, preferences, recipes, meal-planner, shopping)
    // are added in their respective build-plan phases.
  ],
  controllers: [HealthController],
})
export class AppModule {}

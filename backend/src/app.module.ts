import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import configuration from "./config/configuration";
import { validateEnv } from "./config/env.validation";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { PreferencesModule } from "./modules/preferences/preferences.module";
import { PantryModule } from "./modules/pantry/pantry.module";
import { RecipesModule } from "./modules/recipes/recipes.module";
import { MealPlannerModule } from "./modules/meal-planner/meal-planner.module";
import { ShoppingModule } from "./modules/shopping/shopping.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv, // app refuses to boot on invalid env
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    PreferencesModule,
    PantryModule,
    RecipesModule,
    MealPlannerModule,
    ShoppingModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // rate limit first
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // then auth (secure by default)
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}

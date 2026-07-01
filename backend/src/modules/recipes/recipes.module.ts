import { Module } from "@nestjs/common";

import { PantryModule } from "../pantry/pantry.module";
import { GeminiService } from "./ai/gemini.service";
import { RecipesController } from "./recipes.controller";
import { RecipesService } from "./recipes.service";

@Module({
  imports: [PantryModule], // pantry items feed the "use my pantry" generation option
  controllers: [RecipesController],
  providers: [RecipesService, GeminiService],
  exports: [RecipesService],
})
export class RecipesModule {}

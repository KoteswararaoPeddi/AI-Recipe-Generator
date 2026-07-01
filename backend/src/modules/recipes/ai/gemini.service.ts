import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI, Type } from "@google/genai";

import { AppConfig } from "../../../config/config.types";
import { RecipeContent } from "../recipe.mapper";

// Structured-output schema so Gemini returns JSON in exactly the shape we map to a recipe.
const RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    cuisine: { type: Type.STRING },
    difficulty: { type: Type.STRING },
    diet: { type: Type.STRING },
    dietTags: { type: Type.ARRAY, items: { type: Type.STRING } },
    minutes: { type: Type.INTEGER },
    prepMinutes: { type: Type.INTEGER },
    cookMinutes: { type: Type.INTEGER },
    servings: { type: Type.INTEGER },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { amount: { type: Type.STRING }, name: { type: Type.STRING } },
        required: ["amount", "name"],
      },
    },
    steps: { type: Type.ARRAY, items: { type: Type.STRING } },
    nutrition: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.NUMBER },
        protein: { type: Type.NUMBER },
        carbs: { type: Type.NUMBER },
        fats: { type: Type.NUMBER },
        fiber: { type: Type.NUMBER },
      },
      required: ["calories", "protein", "carbs", "fats", "fiber"],
    },
    tips: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["title", "description", "cuisine", "difficulty", "ingredients", "steps", "nutrition"],
};

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly ai: GoogleGenAI;
  private readonly model: string;

  constructor(config: ConfigService<AppConfig, true>) {
    const gemini = config.get("gemini", { infer: true });
    this.ai = new GoogleGenAI({ apiKey: gemini.apiKey });
    this.model = gemini.model;
  }

  /** Calls Gemini for a structured recipe; throws a friendly 503 on any failure. */
  async generateRecipe(prompt: string): Promise<RecipeContent> {
    const text = await this.callWithRetry(prompt);

    try {
      const raw = JSON.parse(text) as Record<string, unknown>;
      return this.normalize(raw);
    } catch {
      this.logger.error(`Could not parse Gemini response: ${text.slice(0, 200)}`);
      throw new ServiceUnavailableException(
        "The AI returned an unexpected response. Please try again.",
      );
    }
  }

  /** Retries transient overloads (503/UNAVAILABLE, 429/RESOURCE_EXHAUSTED) with backoff. */
  private async callWithRetry(prompt: string, maxAttempts = 3): Promise<string> {
    const backoffMs = [600, 1800];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await this.ai.models.generateContent({
          model: this.model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: RECIPE_SCHEMA,
            temperature: 0.8,
          },
        });
        return response.text ?? "";
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        // Quota/usage limit reached — retrying won't help (and burns more quota); fail fast
        // with an accurate, actionable message instead of "try again in a moment".
        if (/\b429\b|RESOURCE_EXHAUSTED|exceeded your current quota|\bquota\b/i.test(message)) {
          this.logger.error(`Gemini quota exceeded: ${message}`);
          throw new ServiceUnavailableException(
            "The AI generation limit for the current Gemini plan has been reached " +
              "(the free tier allows 20 recipes/day). Please try again later or upgrade your Gemini API plan.",
          );
        }

        // Genuine transient overload — retry with backoff.
        const overloaded = /\b503\b|UNAVAILABLE|overloaded|high demand/i.test(message);
        if (overloaded && attempt < maxAttempts) {
          this.logger.warn(`Gemini busy (attempt ${attempt}/${maxAttempts}); retrying...`);
          await this.sleep(backoffMs[attempt - 1] ?? 1800);
          continue;
        }

        this.logger.error(`Gemini request failed: ${message}`);
        throw new ServiceUnavailableException(
          "AI recipe generation is temporarily unavailable. Please try again in a moment.",
        );
      }
    }

    // Unreachable — the loop either returns or throws.
    throw new ServiceUnavailableException("AI recipe generation is temporarily unavailable.");
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** Coerces the (untrusted) AI JSON into a valid RecipeContent with safe fallbacks. */
  private normalize(raw: Record<string, unknown>): RecipeContent {
    const num = (value: unknown, fallback = 0): number => {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    };
    const strArray = (value: unknown): string[] =>
      Array.isArray(value) ? value.map((v) => String(v)) : [];
    const nutrition = (raw.nutrition ?? {}) as Record<string, unknown>;

    return {
      title: String(raw.title ?? "Untitled Recipe"),
      description: String(raw.description ?? ""),
      cuisine: String(raw.cuisine ?? "Any"),
      difficulty: String(raw.difficulty ?? "Medium"),
      diet: String(raw.diet ?? "None"),
      dietTags: strArray(raw.dietTags),
      minutes: num(raw.minutes),
      prepMinutes: raw.prepMinutes != null ? num(raw.prepMinutes) : undefined,
      cookMinutes: raw.cookMinutes != null ? num(raw.cookMinutes) : undefined,
      servings: num(raw.servings, 2),
      ingredients: Array.isArray(raw.ingredients)
        ? raw.ingredients.map((item) => {
            const ing = item as Record<string, unknown>;
            return { amount: String(ing.amount ?? ""), name: String(ing.name ?? "") };
          })
        : [],
      steps: strArray(raw.steps),
      nutrition: {
        calories: num(nutrition.calories),
        protein: num(nutrition.protein),
        carbs: num(nutrition.carbs),
        fats: num(nutrition.fats),
        fiber: num(nutrition.fiber),
      },
      tips: strArray(raw.tips),
    };
  }
}

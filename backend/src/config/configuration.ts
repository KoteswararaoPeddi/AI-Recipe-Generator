import { AppConfig } from "./config.types";

/**
 * Loads validated env into a typed, namespaced config object. Read config through
 * `ConfigService.get(...)` rather than `process.env` in feature code. Validation runs first
 * (see env.validation.ts), so these values are guaranteed present.
 */
export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3001),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    accessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
    refreshTtl: process.env.JWT_REFRESH_TTL ?? "7d",
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY as string,
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  },
});

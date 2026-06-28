import { plainToInstance, Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from "class-validator";

export enum NodeEnv {
  Development = "development",
  Production = "production",
  Test = "test",
}

/**
 * The shape of every environment variable the app depends on. The app **refuses to boot**
 * if validation fails — a config mistake surfaces at startup, not on the first request.
 */
export class EnvironmentVariables {
  @IsOptional()
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 3001;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @MinLength(16, { message: "JWT_ACCESS_SECRET must be at least 16 characters" })
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @MinLength(16, { message: "JWT_REFRESH_SECRET must be at least 16 characters" })
  JWT_REFRESH_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_ACCESS_TTL = "15m";

  @IsOptional()
  @IsString()
  JWT_REFRESH_TTL = "7d";

  @IsString()
  @IsNotEmpty()
  GEMINI_API_KEY!: string;

  @IsOptional()
  @IsString()
  GEMINI_MODEL = "gemini-2.5-flash";

  @IsOptional()
  @IsString()
  CORS_ORIGIN = "http://localhost:3000";
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors
      .map((e) => Object.values(e.constraints ?? {}).join(", "))
      .join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return validated;
}

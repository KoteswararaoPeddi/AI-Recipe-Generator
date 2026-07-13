import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { AppModule } from "./app.module";
import { AppConfig } from "./config/config.types";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { PrismaExceptionFilter } from "./common/filters/prisma-exception.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<AppConfig, true>);

  app.use(helmet());
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Specific filter first so Prisma errors never fall through to the generic 500.
  app.useGlobalFilters(new PrismaExceptionFilter(), new AllExceptionsFilter());
  app.enableCors({
    origin: config.get("corsOrigin", { infer: true }),
    credentials: true,
  });
  app.setGlobalPrefix("api");

    // Redirect root to Swagger docs for convenience.
    app.getHttpAdapter().get("/", (_req, res) => res.redirect("/docs"));

  // Swagger / OpenAPI — UI at /docs, JSON at /docs-json.
  const swaggerConfig = new DocumentBuilder()
    .setTitle("PantryChef API")
    .setDescription(
      "AI Recipe Generator backend. Auth uses HTTP-only cookies: after POST /api/auth/login " +
        "the browser stores them, so 'Try it out' works on protected routes in the same tab.",
    )
    .setVersion("0.1.0")
    .addCookieAuth("access_token")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: { withCredentials: true, persistAuthorization: true },
  });

  app.enableShutdownHooks(); // clean Prisma disconnect on SIGTERM/SIGINT

  const port = config.get("port", { infer: true });
  await app.listen(port);
  Logger.log(`PantryChef API listening on http://localhost:${port}/api`, "Bootstrap");
  Logger.log(`Swagger docs at http://localhost:${port}/docs`, "Bootstrap");
}

void bootstrap();

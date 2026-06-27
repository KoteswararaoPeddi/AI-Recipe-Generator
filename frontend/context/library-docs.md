# Library Docs

How **PantryChef** uses each third-party library — the project-specific patterns and
constraints, not general API docs. Read the relevant section before implementing a feature
that touches one of these. The app is split into `frontend/` (Next.js) and `backend/`
(NestJS); sections are grouped accordingly.

Order of authority: `node_modules/next/dist/docs` (for Next.js) → this file → general knowledge.

---

# Frontend

## axios

The single most important frontend pattern. **All authenticated backend calls go through
the shared instance** — never a bare `fetch`/`axios()`.

```typescript
// shared/lib/axios.config.ts
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // backend origin + /api
  withCredentials: true,                    // auth rides on HTTP-only cookies
})
```

The response interceptor owns cross-cutting concerns:

- **401** → single-flight token refresh (`POST /auth/refresh`) + replay original request;
  on refresh failure, redirect to `/login`. Concurrent 401s queue behind one refresh
  (`isRefreshing` + `failedQueue`).
- **403** → toast "You don't have access to that."
- **5xx** → toast a generic message + console error.

**Rules:**

- Import the default export from `@lib/axios.config` in every service.
- Services return unwrapped, typed domain data (unwrap the `{ success, message, data }` envelope → `.data.data`).
- Don't re-implement 401/403/5xx per call — the interceptor owns it.
- The refresh call uses a bare `axios.post` so it can't recurse through the interceptor.
- Feature services live in `features/<domain>/api/*.service.ts` (`pantry.service`,
  `recipe.service`, `meal-plan.service`, `shopping.service`, `preferences.service`,
  `auth.service`).

## shadcn/ui (Radix + Base UI)

UI primitives live in `src/shared/components/ui` (button, card, input, select, dialog,
table, sheet/drawer, tabs, calendar, tooltip, …), styled with `class-variance-authority`
for variants and the design tokens.

**Rules:**

- Reuse and extend primitives from `shared/components/ui` — don't pull raw Radix/Base UI into feature code.
- Add new primitives via the shadcn workflow (`components.json`); style them with tokens, never hex.
- Compose feature composites (`PantryRow`, `RecipeCard`, `MealSlot`, `ShoppingItemRow`) in the feature or `shared/components`.

## Tailwind CSS v4

- Tokens are defined with `@theme` in `shared/styles/theme.css` (imported by `app/globals.css`) — **no `tailwind.config.ts`** for colors/tokens. See ui-tokens.md.
- Utilities are generated from `--color-*`, `--text-*`, `--radius` variables (e.g. `bg-primary`, `text-foreground`, `border-border`, `text-h2`).
- For conditional/merged classes use the `cn` helper from `@lib/utils`. Never concatenate class strings by hand.

## React Hook Form + Zod

Every form (login, signup, pantry item, preferences, generator filters). The Zod schema is
the single source of truth.

```typescript
const form = useForm<PantryItemValues>({
  resolver: zodResolver(pantryItemSchema),
  defaultValues: DEFAULTS,
  mode: "onBlur",
})
```

- Schemas live in the feature's `schemas/`; derive types via `z.infer`.
- Validate before calling a service. Build inputs from the shared form-field components, not raw inputs.

## Zustand

Cross-cutting client state only: `auth.store` (user/session) and any shared counters chrome
needs (e.g. pantry low-stock count, shopping-list count for a navbar badge).

- Select narrow slices: `useAuthStore((s) => s.user)`.
- Auth checks here are **UX only** — the backend is the authorization source of truth.

## recharts (optional)

Only for the recipe view's nutrition visualisation (calories / macro breakdown). Keep it
behind the recipe view; don't pull charts into other features. Style via token-backed colors.

## lucide-react

Icon set. Direct named imports; size via `className` (`size-4`) or the `size` prop; color
via token-backed classes, never raw hex.

---

# Backend

## NestJS

- One **module** per domain (`auth`, `users`/preferences, `pantry`, `recipes`,
  `meal-planner`, `shopping`); controllers are thin, services hold logic.
- Global `ValidationPipe` (`whitelist: true, transform: true`) in `main.ts`; `cookie-parser` enabled; CORS configured with `credentials: true` and the frontend origin.
- Use Nest exceptions (`NotFoundException`, `ForbiddenException`, …); a global exception filter shapes them into `{ success, message }`.
- A global response interceptor wraps successful returns in `{ success: true, message, data }`.

```typescript
// main.ts (essentials)
app.use(cookieParser())
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
app.enableCors({ origin: process.env.CORS_ORIGIN, credentials: true })
app.setGlobalPrefix("api")
```

## Prisma

- Single injectable `PrismaService extends PrismaClient` (connects `onModuleInit`). Inject it into services; **never** `new PrismaClient()` elsewhere.
- Schema in `prisma/schema.prisma`; change it via `npx prisma migrate dev --name <change>`; commit migrations. `prisma generate` runs on install/migrate.
- Use `select`/`include` deliberately; **never select or return `passwordHash`**.
- Recipe sub-shapes (`ingredients`, `steps`, `nutrition`, `tips`) are stored as `Json`
  columns; `diet`, `cuisine`, `difficulty`, and meal `slot` are **enums** shared across models.
- Every per-user query is scoped to `userId` (pantry, recipes, meal plan, shopping,
  preferences). A generated recipe is persisted only on save.

```typescript
// pantry.service.ts
const items = await this.prisma.pantryItem.findMany({
  where: { userId },
  orderBy: { expiryDate: "asc" },
})
```

## Passport JWT + cookies

- Two tokens: short-lived `access_token`, long-lived `refresh_token`, both **HTTP-only cookies**.
- `JwtStrategy` extracts the token from the request cookie (custom extractor), validates, and returns the user payload.
- Global `JwtAuthGuard`; `@Public()` decorator opts public routes (`/auth/register`, `/auth/login`, `/auth/refresh`) out.
- `/auth/refresh` validates the refresh token and re-issues both cookies. `/auth/logout` clears them.

## bcryptjs

- Hash passwords with a cost factor of 10–12 on register and password change.
- Compare with `bcrypt.compare` on login. Never log, return, or expose the hash.

## class-validator + class-transformer

- Every request body is a **DTO class** with validation decorators (`@IsEmail`, `@IsString`, `@IsInt`, `@Min`, `@IsEnum`, `@IsOptional`, `@IsDateString`, …).
- `whitelist: true` strips unknown properties; `transform: true` coerces query params (e.g. the meal-plan `week`) to their typed form.

```typescript
export class CreatePantryItemDto {
  @IsString() @MinLength(1) name: string
  @IsNumber() @Min(0) quantity: number
  @IsString() unit: string
  @IsOptional() @IsDateString() expiryDate?: string
  @IsOptional() @IsNumber() @Min(0) lowStockThreshold?: number
}
```

## Config validation (`@nestjs/config` + class-validator)

Configuration is **validated at boot** so a bad env crashes the app at startup, not on the
first request. `config/env.validation.ts` defines an `EnvironmentVariables` class with
class-validator decorators; `ConfigModule.forRoot({ isGlobal: true, load: [configuration],
validate: validateEnv })` runs it.

- Validate presence/type of `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
  `GEMINI_API_KEY`; optional `PORT`, `CORS_ORIGIN`, `NODE_ENV` with defaults.
- `config/configuration.ts` returns a **typed, namespaced** object (`jwt.accessSecret`,
  `gemini.model`, …). In feature code read config via `ConfigService.get(...)` /
  `getOrThrow(...)`, **never** `process.env`.

## helmet + `@nestjs/throttler` (security)

- `app.use(helmet())` in `main.ts` for security headers.
- A **global** `ThrottlerGuard` (via `APP_GUARD`) rate-limits everything; tighten limits on
  `/auth/*` (brute force) and `/recipes/generate` (each call costs a paid Gemini request) with
  a route-level `@Throttle(...)`.

## nestjs-pino + `LoggingInterceptor` (logging)

- `LoggerModule.forRoot({ pinoHttp: { autoLogging: false, ... } })`; `app.useLogger(app.get(
  Logger))` and create the app with `bufferLogs: true`. `pino-pretty` transport in dev only;
  redact `authorization` / `cookie` headers.
- `autoLogging` is **off** so a single `LoggingInterceptor` owns request logs (method, url,
  status, latency). Never `console.log` in app code — inject the pino logger.

## PrismaExceptionFilter

A dedicated `@Catch(Prisma.PrismaClientKnownRequestError)` filter maps DB error codes to clean
HTTP responses, keeping the `{ success: false, message }` envelope:

- `P2002` (unique constraint) → **409 Conflict**
- `P2025` (record not found) → **404 Not Found**
- `P2003` (FK constraint) → **400 Bad Request**

Register it **before** `AllExceptionsFilter` in `useGlobalFilters(...)` so Prisma errors are
handled by the specific filter and never fall through to the generic 500.

## Auth decorators (`@Public`, `@CurrentUser`) + graceful shutdown

- `@Public()` (sets metadata) marks the few routes the global `JwtAuthGuard` should skip.
- `@CurrentUser()` is a param decorator returning `request.user` (set by `JwtStrategy`), so the
  `userId` always comes from the verified JWT: `list(@CurrentUser("id") userId: string)`.
- `app.enableShutdownHooks()` in `main.ts` so Prisma disconnects cleanly on SIGTERM/SIGINT.

## Testing (Jest)

- **Unit:** `*.service.spec.ts` next to each service — logic with `PrismaService` mocked.
- **e2e:** `test/*.e2e-spec.ts` — real HTTP through the app against a dedicated test database.

---

## Google Gemini — AI recipe generation

PantryChef's AI runs **server-side in NestJS** via the official `@google/genai` SDK. The
`GEMINI_API_KEY` lives only in `backend/.env` — it is never exposed to the browser, and the
frontend only talks to our own NestJS endpoint (`POST /api/recipes/generate`).

```bash
npm install @google/genai   # in backend/
```

```typescript
import { GoogleGenAI } from "@google/genai"
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
```

### Model

| Use case | Model | Why |
| --- | --- | --- |
| Recipe generation | `gemini-2.5-flash` | Fast, cost-effective, strong instruction-following for structured recipe output. The project default. |

Use the exact model id `gemini-2.5-flash`.

### Generation — structured recipe output

The generator takes the user's pantry items plus the active diet and cuisine filters, builds
a prompt, and asks Gemini for a **single recipe as JSON** (so the frontend renders fields
directly instead of parsing prose). Use `responseMimeType: "application/json"` with a
`responseSchema` so the model returns a typed object.

```typescript
// recipes/ai/ai.service.ts (essentials)
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: buildRecipePrompt({ pantry, diet, cuisine }),
  config: {
    responseMimeType: "application/json",
    responseSchema: RECIPE_RESPONSE_SCHEMA, // title, cuisine, diet, difficulty, servings,
                                            // ingredients[], steps[], nutrition{}, tips[]
    temperature: 0.7,
  },
})
const recipe = JSON.parse(response.text) // validate before returning to the client
```

**Rules:**

- **Build the prompt from the authenticated user's pantry + filters only** — never trust a
  pantry or userId the client supplies beyond the request's authenticated identity.
- **Honour the active diet and cuisine filters** explicitly in the prompt and the schema
  (`diet`/`cuisine` enums) — a vegan request must never return meat.
- **Validate the parsed JSON** (e.g. a Zod/DTO check) before returning — treat model output
  as untrusted; reject/repair malformed shapes rather than passing them through.
- The generate endpoint **returns** the recipe; it does **not** persist it. Saving is the
  separate `POST /api/recipes` flow.
- Prefer pantry ingredients; clearly mark anything the recipe needs that isn't in the pantry
  (this feeds the "add missing to shopping list" action).

### Failure handling

- Wrap every Gemini call in try/catch. On error (timeout, quota, safety block, malformed
  output after a repair attempt), return a clean 4xx/5xx with a friendly message — the rest of
  the app (pantry, saved recipes, planner, shopping) must keep working without AI.
- Log failures with a `[AiService]` prefix; never log the API key.
- `GEMINI_API_KEY` is backend-only — never `NEXT_PUBLIC_`, never sent to the client.

---

## Out of scope

PantryChef has **no payments, social, or third-party store integrations** — deliberate scope
decisions (see project-overview.md). Do not add a payment SDK, an auth provider beyond the
JWT/bcryptjs flow above, or a second LLM provider. If any of these is introduced later,
document its pattern here first.
</content>

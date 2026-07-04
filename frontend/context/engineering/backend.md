# Backend — Engineering Decisions (NestJS)

> Notable backend decisions, written to **teach**. Most entries carry a `Learn` block: vocabulary (if
> needed) → ❌ naive vs ✅ our code → why → **where else you'd use it** → rule of thumb. See
> [README](./README.md). DB/Prisma → [database.md](./database.md); auth → [auth-security.md](./auth-security.md);
> Gemini → [ai.md](./ai.md).
>
> **Stack:** NestJS 11 (Express) · Prisma 6 + PostgreSQL · `@google/genai` 2.10 (Gemini 2.5 Flash) ·
> `@nestjs/jwt` + Passport-JWT + bcryptjs · class-validator/transformer · `@nestjs/config` ·
> helmet · `@nestjs/throttler` · Swagger. TypeScript 5.7, Node 22 types.

## Module & Service Structure

### Global `@Global()` PrismaModule with a single shared client
- **What:** One `PrismaService extends PrismaClient` (with `onModuleInit → $connect`) exported globally; feature modules inject it rather than `new PrismaClient()`.
- **Where:** `backend/src/prisma/prisma.module.ts:4`, `backend/src/prisma/prisma.service.ts:8`.
- **Why:** Avoids connection-pool sprawl and repeated client instantiation across modules.
- **Learn**

  **Vocabulary:** *Dependency Injection (DI)* — instead of a class creating its own dependencies, it
  *asks* for them in its constructor and the framework supplies a shared instance. A *provider* is a
  class Nest can inject (like a service). A *singleton* is one shared instance for the whole app.

  ````ts
  // ❌ every service news up its own client → many connection pools, exhausts the DB's connection limit
  export class RecipesService {
    private prisma = new PrismaClient()   // a fresh pool here, another in every other service…
  }

  // ✅ one client, provided globally, injected everywhere
  @Global()                               // exported once, importable by NO module — it's ambient
  @Module({ providers: [PrismaService], exports: [PrismaService] })
  export class PrismaModule {}

  @Injectable()
  export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() { await this.$connect() }   // connect once at startup
  }

  export class RecipesService {
    constructor(private readonly prisma: PrismaService) {}   // inject the ONE shared instance
  }
  ````

  A DB client holds a **connection pool** (a set of open DB connections). Creating one per service
  multiplies pools and quickly hits Postgres's connection cap. Making `PrismaService` a **global
  singleton** means the whole app shares one pool, and Nest hands the same instance to every constructor
  that asks for it. `@Global()` saves you from importing `PrismaModule` in every feature module.

  **Where else you'd use it:** any expensive-to-create, stateful resource that should be shared — a Redis
  client, an HTTP client with connection reuse, a config service, a logger. All belong as injected
  singletons, not `new`'d per-use.

  **Rule of thumb:** shared infrastructure (DB, cache, external clients) = one injected singleton. Reach
  for `@Global()` when nearly every module needs it, so you don't re-import it everywhere.

### Typed, namespaced config read through ConfigService (never `process.env`)
- **What:** A namespaced config loader + typed config interfaces are made global; feature code reads `config.get("gemini", { infer: true })` with type inference and never touches `process.env`.
- **Where:** `backend/src/config/configuration.ts`, `backend/src/config/config.types.ts`, registered in `backend/src/app.module.ts:22-24`.
- **Why:** Centralizes config, keeps it typed, and keeps secrets out of scattered `process.env` reads.
- **Learn**

  ````ts
  // ❌ raw process.env everywhere — untyped, stringly-keyed, no autocomplete, typo = silent undefined
  const key = process.env.GEMINI_API_KEY          // string | undefined, spelled correctly? who knows
  const ttl = Number(process.env.JWT_ACCESS_TTL)  // parsing scattered across the codebase

  // ✅ one typed, namespaced config; feature code asks ConfigService with inference
  // configuration.ts
  export default () => ({
    gemini: { apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash" },
    jwt: { accessSecret: process.env.JWT_ACCESS_SECRET, accessTtl: process.env.JWT_ACCESS_TTL ?? "15m" },
  })
  // anywhere
  const gemini = this.config.get("gemini", { infer: true })   // fully typed: gemini.apiKey, gemini.model
  ````

  Reading `process.env` directly scatters string keys and parsing through the app; one typo yields a
  silent `undefined` that explodes far from the cause. A **namespaced config** collects all env access in
  one place, groups it (`gemini.*`, `jwt.*`), applies defaults, and — with `{ infer: true }` — gives you
  typed, autocompleted access. Env parsing happens once, at the edge.

  **Where else you'd use it:** every non-trivial app — group config by concern (db, auth, thirdparty),
  validate at boot (see next entry), and inject it. The same idea applies on the frontend with typed env
  wrappers.

  **Rule of thumb:** read `process.env` in exactly one place (the config loader), give it types and
  defaults, and inject it everywhere else. Never sprinkle `process.env` through business logic.

### RecipesModule imports PantryModule for cross-feature data
- **What:** RecipesModule imports PantryModule and depends on `PantryService` for the "use my pantry" generation path, instead of querying the pantry tables directly.
- **Where:** `backend/src/modules/recipes/recipes.module.ts:9`.
- **Why:** Keeps feature data access behind its owning service rather than reaching across module boundaries into another feature's tables.
- **Learn**

  ````ts
  // ❌ RecipesService reaches straight into the pantry's tables — now two features know the pantry schema
  const items = await this.prisma.pantryItem.findMany({ where: { userId } })

  // ✅ import the module, depend on its service — the pantry owns its own data access
  @Module({ imports: [PantryModule], /* … */ })   // PantryModule must `exports: [PantryService]`
  export class RecipesModule {}
  export class RecipesService {
    constructor(private readonly pantry: PantryService) {}
    // …uses this.pantry.list(userId) — if the pantry schema changes, only PantryService changes
  }
  ````

  Each feature module **owns** its slice of the data. When recipes need pantry data, they go through
  `PantryService` rather than querying `pantryItem` directly. That keeps knowledge of the pantry schema in
  one module — change it once, not in every feature that happened to read those tables. This is
  *encapsulation* at the module level.

  **Where else you'd use it:** orders needing customer data → import CustomerModule; any feature that
  needs another's data → depend on its service, not its tables. If two modules need each other, that's a
  smell — extract the shared piece into a common module.

  **Rule of thumb:** talk to other features through their **service**, never their tables. One module =
  one owner of its data.

## API Design

### Fail-fast env validation — app refuses to boot on bad config
- **What:** Environment variables are validated at startup against a class-validator `EnvironmentVariables` class (e.g. JWT secrets `@MinLength(16)`, DATABASE_URL/GEMINI_API_KEY required); invalid config throws at boot.
- **Where:** `backend/src/config/env.validation.ts:69-83`, wired via `validate: validateEnv` in `app.module.ts:25`.
- **Why:** Config errors surface immediately at startup, not as a mysterious failure on the first request.
- **Learn**

  ````ts
  // ❌ discover a missing/short secret at RUNTIME, deep in a request, as a confusing error (or worse,
  //    a working-but-insecure deploy with a 4-char JWT secret)
  const secret = process.env.JWT_ACCESS_SECRET   // undefined? you find out when a token fails to verify

  // ✅ validate the whole environment at BOOT; refuse to start if anything's wrong
  class EnvironmentVariables {
    @IsString() DATABASE_URL: string
    @MinLength(16) JWT_ACCESS_SECRET: string       // a weak secret fails startup, not silently ships
    @IsString() GEMINI_API_KEY: string
  }
  // ConfigModule.forRoot({ validate: validateEnv })  → throws & exits before the server listens
  ````

  **Fail-fast** means: detect a fatal problem as early as possible and stop, loudly. A missing DB URL or a
  too-short JWT secret is fatal — better to crash on `npm start` with a clear message than to boot and
  fail unpredictably later (or run insecurely). Validating env at startup turns "mysterious 3am incident"
  into "deploy refused with a clear error."

  **Where else you'd use it:** validate config, feature flags, required files/credentials, and external
  connectivity at startup. Any invariant that must hold for the app to work correctly → assert it before
  serving traffic.

  **Rule of thumb:** validate everything the app *needs to be correct* at boot and crash with a clear
  message if it's missing. Fail fast and loud beats fail slow and silent.

### Global `ValidationPipe({ whitelist: true, transform: true })`
- **What:** App-wide pipe strips unknown properties and transforms payloads to DTO instances; DTOs enforce constraints (e.g. servings `@Min(1)/@Max(12)`, `@IsString({ each: true })`).
- **Where:** `backend/src/main.ts:19`; DTO e.g. `backend/src/modules/recipes/dto/generate-recipe.dto.ts`.
- **Why:** One validation contract for every endpoint. Note: `forbidNonWhitelisted` is **not** set — unknown fields are silently dropped, not rejected.
- **Learn**

  **Vocabulary:** a *DTO* (Data Transfer Object) is a class describing the shape of an incoming request
  body, annotated with validation rules. A *pipe* runs before your handler to transform/validate input.

  ````ts
  // ❌ validate by hand in every controller — repetitive, easy to forget a field, inconsistent errors
  if (typeof body.servings !== "number" || body.servings < 1) throw new BadRequestException()

  // ✅ declare rules once on a DTO; a global pipe enforces them for EVERY endpoint
  export class GenerateRecipeDto {
    @IsString({ each: true }) ingredients: string[]
    @Min(1) @Max(12) servings: number
  }
  // main.ts
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  //   whitelist → strip properties not on the DTO   |   transform → turn the plain JSON into a DTO instance (+ type coercion)
  ````

  Validation as **declaration, not procedure**: the rules live as decorators on the DTO, and one global
  pipe applies them everywhere, returning consistent 400s. `whitelist` drops unexpected fields (defense
  against over-posting); `transform` gives you a real typed instance. Our **gotcha**: without
  `forbidNonWhitelisted`, unknown fields are silently *dropped* rather than *rejected* — so if a client
  sends `role: "admin"`, it vanishes quietly instead of erroring (usually fine, occasionally surprising).

  **Where else you'd use it:** every request body/query/param on any API; the same class-validator
  approach validates config (previous entry) and nested objects. Mirror the DTO rules in the frontend's
  Zod schema so both ends agree.

  **Rule of thumb:** never hand-validate in controllers. Put rules on DTOs + a global `ValidationPipe`.
  Turn on `forbidNonWhitelisted` when you want unknown fields to be an error, not a silent drop.

### Uniform response envelope via interceptor
- **What:** A global interceptor wraps every success as `{ success, message, data }`; a handler may return `{ message, data }` to set its own message, else defaults to `"OK"`.
- **Where:** `backend/src/common/interceptors/response.interceptor.ts:25-46`; used in controllers e.g. `recipes.controller.ts:28`.
- **Why:** Single response contract the frontend can unwrap uniformly (`ApiResponse<T>`), instead of hand-shaping each response.
- **Learn**

  **Vocabulary:** an *interceptor* sits between your controller and the HTTP response, so it can transform
  every return value in one place (it's the "output" cousin of a pipe).

  ````ts
  // ❌ every controller hand-shapes its own envelope — easy to drift (one forgets `success`,
  //    another names it `payload`), and the frontend must handle each shape
  @Get() list() { return { success: true, message: "OK", data: items } }

  // ✅ controllers return raw data (or { message, data }); ONE interceptor wraps it
  @Injectable()
  export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(_ctx, next: CallHandler<T>): Observable<ApiResponse<T>> {
      return next.handle().pipe(map((payload) => {
        if (payload && typeof payload === "object" && "data" in payload && "message" in payload) {
          const { data, message } = payload as { data: T; message: string }
          return { success: true, message, data }            // handler set its own message
        }
        return { success: true, message: "OK", data: payload } // bare payload → default message
      }))
    }
  }
  // Controller stays clean:  @Get() list() { return items }  // → { success:true, message:"OK", data:items }
  ````

  `next.handle()` is the controller's result as an RxJS stream; `.pipe(map(...))` reshapes it. Registered
  globally, *every* endpoint emits the identical envelope with no per-controller boilerplate — and the
  frontend's service layer has exactly one shape to unwrap (see the client-services entry in
  [frontend.md](./frontend.md)).

  **Where else you'd use it:** adding timing headers, camelCase↔snake_case conversion, stripping internal
  fields, wrapping in a standard envelope — any cross-cutting *output* shaping.

  **Rule of thumb:** cross-cutting *output* → interceptor. Cross-cutting *input* rejection (auth,
  validation) → guard/pipe. Errors → filter. Learn which of the three a concern belongs to.

### Domain-appropriate range query for the meal planner (not offset/cursor)
- **What:** Meal-plan reads take `weekStart`/`weekEnd` (`@IsDateString`) and query a `date: { gte, lte }` window; other lists return all rows ordered `createdAt desc`. No offset/cursor pagination anywhere.
- **Where:** `backend/src/modules/meal-planner/dto/meal-plan-query.dto.ts`, `meal-planner.service.ts:31-41`.
- **Why:** The planner is inherently windowed by week; generic paging would be the wrong model.
- **Learn**

  ````ts
  // ❌ shoehorn generic pagination onto a calendar — page 3 of meals? meaningless to the user
  findMany({ where: { userId }, skip: 40, take: 20 })

  // ✅ query the natural window the UI actually shows: one week
  findMany({ where: { userId, date: { gte: new Date(weekStart), lte: new Date(weekEnd) } } })
  ````

  Pick the access pattern that matches how the data is *used*. A meal planner is viewed one week at a
  time, so a **date-range** query is the honest model — the client asks for the week it's showing.
  Offset/cursor pagination is for open-ended lists (feeds, search results), not a bounded calendar. Using
  the wrong model adds complexity that never fits the UI.

  **Where else you'd use range queries:** anything time-bounded — analytics dashboards (date pickers),
  logs, calendars, "activity this month." Reach for **cursor pagination** instead when you have long,
  append-heavy lists scrolled infinitely; **offset** only for small, page-numbered tables.

  **Rule of thumb:** let the UI's access pattern choose the query shape. Range for windows, cursor for
  infinite scroll, offset for small numbered pages. Don't default to pagination reflexively.

### Enum/label boundary mapping with safe fallbacks
- **What:** Bidirectional Prisma-enum ↔ frontend-label maps; reverse lookups are case-insensitive and fall back to a default (`Cuisine.ANY`, `Difficulty.MEDIUM`).
- **Where:** `backend/src/common/enums/enum-maps.ts:47-71`, `backend/src/modules/recipes/recipe.mapper.ts`.
- **Why:** A stray AI-generated or legacy-client value maps to a sane default instead of throwing.
- **Learn**

  ````ts
  // ❌ trust external text to match your enum exactly — one odd value from the AI/old client throws
  const cuisine = Cuisine[label.toUpperCase()]   // "Fusion"? undefined → downstream crash

  // ✅ map at the boundary, case-insensitively, with a fallback for the unknown
  export function labelToCuisine(label: string): Cuisine {
    return LABEL_TO_CUISINE[label.trim().toLowerCase()] ?? Cuisine.ANY   // unknown → safe default
  }
  ````

  The DB speaks enums (`ANY`, `MEDIUM`); the outside world (AI output, older clients) speaks free text.
  A **boundary mapper** (a.k.a. anti-corruption layer) translates between them in one place and *degrades
  gracefully* on the unexpected instead of throwing. Your core stays clean and enum-typed; the messiness
  is contained at the edge.

  **Where else you'd use it:** translating third-party API responses into your domain types, versioned
  API payloads, importing CSV/user data — anywhere external vocabulary meets your internal model.

  **Rule of thumb:** translate external values to internal types at the boundary, case-insensitively,
  with a safe default for unknowns. Never let unvalidated outside strings flow straight into typed core
  logic.

### Swagger configured for cookie-auth "Try it out"
- **What:** Swagger uses `addCookieAuth("access_token")` + `withCredentials`/`persistAuthorization`.
- **Where:** `backend/src/main.ts:29-41`.
- **Why:** Protected routes stay testable in-browser even though auth is HTTP-only cookie based. *(Docs endpoint `/docs` is itself un-gated — noted, no lesson.)*

## Error Handling & Reliability

### Ordered global filters — Prisma-specific before generic catch-all
- **What:** `PrismaExceptionFilter` maps `P2002→409`, `P2025→404`, `P2003→400` into the `{ success:false, message }` envelope; registered before the catch-all so DB errors never fall through to a generic 500.
- **Where:** `backend/src/main.ts:21`; `backend/src/common/filters/prisma-exception.filter.ts`; catch-all `all-exceptions.filter.ts`.
- **Why:** Turns raw Prisma error codes into correct HTTP semantics without leaking DB internals.
- **Learn**

  **Vocabulary:** an *exception filter* catches errors thrown anywhere in a request and shapes the HTTP
  response. `@Catch(SomeError)` narrows *which* errors a filter handles.

  ````ts
  @Catch(Prisma.PrismaClientKnownRequestError)          // only Prisma "known" errors
  export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception, host) {
      let status = 500, message = "Database error."
      switch (exception.code) {
        case "P2002": status = 409; message = "That value already exists."; break  // unique clash
        case "P2025": status = 404; message = "The requested record was not found."; break
        case "P2003": status = 400; message = "Related record does not exist."; break // FK violation
      }
      host.switchToHttp().getResponse().status(status).json({ success: false, message })
    }
  }
  // main.ts — ORDER MATTERS: specific first, generic catch-all last
  app.useGlobalFilters(new PrismaExceptionFilter(), new AllExceptionsFilter())
  ````

  Without this, a duplicate-email insert throws a raw Prisma error the generic handler turns into a
  meaningless `500` (and may leak the constraint name). Nest tries filters **most-recently-registered
  outward**, so the `@Catch`-narrowed Prisma filter gets first refusal and maps `P2002 → 409 Conflict`;
  anything it doesn't match falls through to the catch-all.

  **Where else you'd use it:** map any library's error types to clean HTTP codes — a payment SDK's errors,
  validation libraries, file-system errors. Specific handlers first, broad catch-all last.

  **Rule of thumb:** register error handlers **specific → general**. A narrow `@Catch(X)` must precede the
  broad `@Catch()`, or the catch-all swallows everything first.

### Leak-proof catch-all filter
- **What:** HttpExceptions keep their status/message (array validation messages flattened to the first); any non-Http `Error` is logged server-side and returned as a generic 500.
- **Where:** `backend/src/common/filters/all-exceptions.filter.ts:20-45`.
- **Why:** Internal error details never reach the client, while validation errors stay readable.
- **Learn**

  ````ts
  // ❌ let a raw error reach the client — leaks stack traces, file paths, SQL, library internals
  catch (e) { res.status(500).json({ error: e.message, stack: e.stack }) }   // attacker's recon gift

  // ✅ known HTTP errors pass through; everything else is logged internally, generic message out
  catch(exception, host) {
    if (exception instanceof HttpException) {
      return res.status(exception.getStatus()).json({ success: false, message: cleanMessage(exception) })
    }
    this.logger.error(exception)                                   // full detail → server logs only
    res.status(500).json({ success: false, message: "Internal server error." })   // opaque to client
  }
  ````

  Errors you *chose* to throw (`NotFoundException`, `BadRequestException`) carry safe, intentional
  messages — pass them through. Errors you *didn't* expect (a null deref, a driver error) may contain
  sensitive internals — those get **logged server-side** for you to debug, but the client only sees a
  generic 500. This split (trusted vs untrusted errors) is a core security habit.

  **Where else you'd use it:** every production API needs a top-level error boundary that distinguishes
  intentional 4xx from unexpected 5xx and never leaks internals. Same idea as a React error boundary on
  the frontend.

  **Rule of thumb:** expose the errors you threw on purpose; log-and-genericize everything else. Stack
  traces and internal messages are for your logs, never the response body.

### Health endpoint degrades gracefully on DB failure
- **What:** Wraps `SELECT 1` in try/catch and reports `db: "down"` instead of throwing, so liveness still returns 200.
- **Where:** `backend/src/modules/health/health.controller.ts:14-22`.
- **Why:** A DB blip shouldn't make the liveness probe fail and trigger a restart loop.
- **Learn**

  ````ts
  // ✅ report dependency health as DATA; keep the endpoint itself alive
  @Get() @Public()
  async health() {
    let db = "up"
    try { await this.prisma.$queryRaw`SELECT 1` } catch { db = "down" }  // never throws
    return { status: "ok", db }                                          // 200 with a truthful body
  }
  ````

  A subtlety in ops: a **liveness** probe answers "is the *process* alive?" — if it 500s when the DB is
  down, your orchestrator may *restart the app*, which doesn't fix the DB and can cause crash loops.
  Reporting `db: "down"` as *data* (still 200) tells monitoring the truth without killing a healthy
  process. (A separate **readiness** probe is where you'd legitimately fail to stop routing traffic.)

  **Where else you'd use it:** status pages, health/monitoring endpoints, "degraded mode" banners — report
  the state of each dependency rather than collapsing the whole endpoint on one failure.

  **Rule of thumb:** don't let one failing dependency take down an endpoint whose job is to *report*
  status. Surface degradation as data; reserve hard failures for readiness checks.

### Graceful shutdown hooks
- **What:** `app.enableShutdownHooks()` for clean Prisma disconnect on SIGTERM/SIGINT.
- **Where:** `backend/src/main.ts:43`.
- **Why:** Closes DB connections cleanly on deploy/restart. *(Small but real — one line that prevents leaked connections on redeploy; no deeper lesson.)*

### Rate limiting ordered before auth
- **What:** `ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }])`, with `ThrottlerGuard` as the **first** global guard (before `JwtAuthGuard`).
- **Where:** `backend/src/app.module.ts:27,38-41`.
- **Why:** Throttling applies even to unauthenticated routes (login/refresh), so auth endpoints can't be hammered.
- **Learn**

  ````ts
  // ORDER MATTERS: guards run in registration order. Throttle FIRST so it also covers /login, /refresh.
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },   // 1. cap request rate (even for anonymous users)
    { provide: APP_GUARD, useClass: JwtAuthGuard },     // 2. then require auth
  ]
  ````

  If auth ran first, unauthenticated endpoints (login, refresh, register) would sit *outside* the rate
  limiter — exactly the endpoints attackers brute-force. Putting the throttler first means credential
  stuffing and refresh hammering hit the 100/min cap before touching auth logic. The general lesson:
  **the order of cross-cutting layers changes what they protect.**

  **Where else you'd use it:** ordering middleware/guards deliberately — CORS before auth, request-id
  logging first, body-size limits before parsing. Any pipeline where "who runs first" affects coverage.

  **Rule of thumb:** put rate limiting (and other abuse protections) *before* auth, so they also shield
  the unauthenticated endpoints attackers target. Think about guard/middleware order, don't leave it to
  chance.

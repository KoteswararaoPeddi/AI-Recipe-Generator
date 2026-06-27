# Architecture

PantryChef is a **full-stack** application in two deployables. The frontend renders the UI
and talks **only** to our own REST API; the backend owns authentication, persistence, and
every Google Gemini call.

```
frontend/   → Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/ui
backend/    → NestJS + Prisma + PostgreSQL  (REST API under /api, JWT auth, Gemini)
```

The browser never sees the database or the `GEMINI_API_KEY`. AI runs server-side in NestJS.

---

## Stack

### Frontend

| Layer        | Tool                              | Purpose                                                       |
| ------------ | --------------------------------- | ------------------------------------------------------------- |
| Framework    | Next.js 16 (App Router)           | Routing, rendering, route groups                              |
| UI runtime   | React 19                          | Component model                                               |
| Language     | TypeScript (strict)               | Throughout                                                    |
| Styling      | Tailwind CSS v4 + tw-animate-css  | Utility styling and animation                                 |
| Components   | shadcn/ui (Radix + Base UI)       | Accessible UI primitives in `src/shared/components/ui`        |
| Icons        | lucide-react                      | Icon set                                                      |
| Fonts        | `next/font/google` (Poppins)      | Self-hosted webfont, exposed as `--font-poppins`              |
| HTTP         | axios (shared instance)           | All API calls; JWT + 401-refresh handled by the interceptor   |
| Forms        | React Hook Form + Zod             | Every form (auth, pantry, generator, preferences)             |
| Client state | Zustand                           | Cross-cutting client state (`auth.store`, shopping/pantry)    |
| Charts       | recharts                          | Nutrition visualisation in the recipe view (optional)         |

### Backend

| Layer        | Tool                              | Purpose                                                       |
| ------------ | --------------------------------- | ------------------------------------------------------------- |
| Framework    | NestJS                            | Modular REST API; controllers thin, services hold logic       |
| ORM          | Prisma                            | Typed DB access + migrations                                  |
| Database     | PostgreSQL                        | Users, preferences, pantry, recipes, meal plans, shopping     |
| Auth         | Passport JWT + bcryptjs           | JWT sessions (HTTP-only cookies); password hashing            |
| Validation   | class-validator / class-transformer | Request DTO validation + boot-time env validation           |
| Security     | helmet + `@nestjs/throttler`      | Security headers; rate limiting (esp. `/auth`, `/recipes/generate`) |
| Logging      | nestjs-pino (pino)                | Structured request logging via a `LoggingInterceptor`         |
| AI           | Google Gemini 2.5 Flash (`@google/genai`) | Recipe generation (server-side only)                  |

> **AI provider is Google Gemini, not Anthropic/Claude.** Model: `gemini-2.5-flash`. The
> `GEMINI_API_KEY` lives only in `backend/.env`, never `NEXT_PUBLIC_`, never sent to the
> browser. The frontend only calls our `/api/recipes/generate` endpoint.

---

## Domain Model (Prisma / PostgreSQL)

```
User            id, email (unique), passwordHash, createdAt
Preference      userId (1:1), defaultDiet, defaultCuisine
PantryItem      id, userId, name, quantity, unit, expiryDate, lowStockThreshold
Recipe          id, userId, title, cuisine, diet, difficulty, servings,
                ingredients (Json), steps (Json), nutrition (Json), tips (Json),
                source (AI | manual), createdAt
MealPlanEntry   id, userId, date (or weekStart+dayOfWeek), slot (BREAKFAST|LUNCH|DINNER),
                recipeId
ShoppingItem    id, userId, name, quantity, unit, checked
```

- `Diet` and `Cuisine` are enums shared by Preference, Recipe, and the generator filters.
- A generated recipe is **persisted only when the user saves it** (Recipe Collection);
  unsaved generations are returned to the client but not stored.
- **Never select or return `passwordHash`.** All rows are scoped to the authenticated
  `userId`.

---

## Backend Folder Structure (production-grade, four layers)

The backend is a **modular monolith**: one deployable, strict module boundaries. Four
top-level layers read clearly — `config/`, `common/`, `prisma/`, and `modules/`. Feature
modules live under `src/modules/` (not flat in `src/`).

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                    → enum reference data / sample pantry (optional)
└── src/
    ├── main.ts                    → bootstrap: pipes, filters, interceptors, helmet, CORS, shutdown hooks
    ├── app.module.ts              → root: imports config + infra + all feature modules
    │
    ├── config/                    → typed, validated configuration
    │   ├── configuration.ts        → config factory (returns a typed, namespaced object)
    │   ├── env.validation.ts       → schema; the app REFUSES TO BOOT on invalid env
    │   └── config.types.ts
    │
    ├── common/                    → cross-cutting, domain-agnostic. Imports NOTHING from modules/.
    │   ├── decorators/             → @CurrentUser(), @Public()
    │   ├── filters/                → AllExceptionsFilter, PrismaExceptionFilter
    │   ├── interceptors/           → ResponseInterceptor, LoggingInterceptor
    │   ├── guards/                 → JwtAuthGuard (global), added in the auth phase
    │   ├── pipes/
    │   ├── dto/                    → shared DTOs (e.g. PaginationQueryDto)
    │   └── types/
    │
    ├── prisma/                    → PrismaService + PrismaModule (@Global)
    │
    └── modules/                   → one folder per domain — the heart of the app
        ├── auth/                   → register/login/refresh/logout, JwtStrategy, guard
        ├── users/                  → preferences: GET/PUT default diet + cuisine
        ├── pantry/                 → CRUD pantry items; expiry + low-stock derivation
        ├── recipes/                → save / list / search / filter saved recipes
        ├── ai/                     → Gemini wrapper, injected into recipes (isolated)
        ├── meal-planner/           → weekly entries by slot; week navigation queries
        └── shopping/               → list CRUD; "add to pantry" promotion
    └── test/                       → e2e specs (test/*.e2e-spec.ts)
```

### Module boundary rule (what keeps it production-grade)

`common/` and `prisma/` **never import from `modules/`**. A module **never imports another
module's internals** — it imports another module's **exported service** through the Nest
module system only. This is what stops the app rotting into circular dependencies.

### Anatomy of one feature module

Every domain folder has the same shape (using `pantry/` as the template):

```
modules/pantry/
├── pantry.module.ts          → wires controller + service; exports the service if others need it
├── pantry.controller.ts      → THIN — HTTP only: route, @CurrentUser, call service, return
├── pantry.service.ts         → ALL business logic + Prisma access
├── dto/
│   ├── create-pantry-item.dto.ts   → class-validator decorators = the request contract
│   ├── update-pantry-item.dto.ts   → PartialType(CreateDto)
│   └── pantry-query.dto.ts
├── entities/
│   └── pantry-item.entity.ts → response/serialization shape (what leaves the API)
└── pantry.service.spec.ts    → unit tests
```

- **Controllers are thin** — no Prisma, no logic; translate HTTP ↔ service. If a handler is
  more than ~5 lines, logic leaked in.
- **Services own logic and persistence** — take the authenticated `userId`, scope every query
  to it, throw Nest exceptions (`NotFoundException`, `ForbiddenException`); never return raw DB
  errors.
- **DTOs are the input contract** — every body is a class with validation decorators;
  `ValidationPipe({ whitelist: true })` strips anything not declared.
- **Entities are the output contract** — `@Exclude()`/`@Expose()` (class-transformer) so
  `passwordHash` can never serialize out.
- **The AI module is isolated** — `ai/` wraps Gemini behind a service interface, injected into
  `recipes`. Swapping models or SDK touches one file; the rest stays testable without the API.

> The current scaffold is the lighter starting point — `health/` sits flat under `src/`, and
> `config/` plus the `modules/` restructure are **documented here but not yet applied**. The
> move to this structure happens as the feature phases land (see build-plan.md / progress-tracker.md).

API surface (all under `/api`, all authenticated except auth routes):

```
POST   /auth/register        POST /auth/login      POST /auth/refresh    POST /auth/logout
GET    /pantry               POST /pantry          PATCH /pantry/:id     DELETE /pantry/:id
POST   /recipes/generate     → Gemini; returns a recipe (not yet saved)
GET    /recipes              POST /recipes (save)  GET /recipes/:id      DELETE /recipes/:id
GET    /meal-plan?week=...   POST /meal-plan       DELETE /meal-plan/:id
GET    /shopping             POST /shopping        PATCH /shopping/:id    POST /shopping/:id/to-pantry
GET    /preferences          PUT  /preferences
```

---

## Frontend Folder Structure

Feature-based. Routing lives in `src/app` (thin route entries using route groups), feature
UI lives in `src/features/*`, and cross-cutting UI/utilities live in `src/shared`.

```
frontend/src/
├── app/                                  → App Router. Route groups only; pages stay thin.
│   ├── layout.tsx                         → Root layout: metadata, Poppins font
│   ├── globals.css                        → Tailwind entry + imports theme.css
│   ├── (auth)/                            → login + signup (no app chrome)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── (app)/                             → authenticated app shell (Navbar/Sidebar + main)
│       ├── layout.tsx                     → guards session; renders chrome
│       ├── pantry/page.tsx
│       ├── generate/page.tsx
│       ├── recipes/page.tsx               → collection (search/filter)
│       ├── recipes/[id]/page.tsx          → recipe view
│       ├── meal-planner/page.tsx
│       ├── shopping-list/page.tsx
│       └── preferences/page.tsx
│
├── features/                             → one vertical slice per domain
│   ├── auth/                              → login/signup forms, auth service, store
│   ├── pantry/                            → PantryTable, item form, expiry/low-stock badges
│   ├── generator/                         → filter controls, generate action, result view
│   ├── recipes/                           → RecipeCard, RecipeView, collection search/filter
│   ├── meal-planner/                      → weekly grid, slot cells, week nav
│   ├── shopping-list/                     → list, check-off, add-to-pantry
│   └── preferences/                       → preferences form
│       each slice may carry: components/ · data/ · hooks/ · schemas/ · api/ · types/
│
└── shared/                              → cross-cutting, framework-agnostic
    ├── components/
    │   ├── ui/                            → shadcn/ui primitives
    │   ├── Navbar.tsx · Sidebar.tsx · Footer.tsx · Logo.tsx
    ├── config/                            → navigation config, diet/cuisine option lists
    ├── constants/                         → route paths, slot names, enum labels
    ├── lib/
    │   ├── axios.config.ts                → shared axios instance + interceptors
    │   └── utils.ts                       → cn() + helpers
    ├── stores/                            → auth.store (Zustand) and other cross-cutting state
    ├── hooks/
    ├── types/
    └── styles/theme.css                   → design tokens (see ui-tokens.md)
```

### Import aliases (`frontend/tsconfig.json`)

```jsonc
"@/*":          ["./src/*"]
"@app/*":       ["./src/app/*"]
"@features/*":  ["./src/features/*"]
"@shared/*":    ["./src/shared/*"]
"@components/*": ["./src/shared/components/*"]
"@lib/*":       ["./src/shared/lib/*"]
```

Use these — never deep relative imports. `cn` from `@lib/utils`; primitives from
`@components/ui/*`; the shared axios instance from `@lib/axios.config`.

---

## Rendering & Data Flow

- **Server Components by default.** A component becomes a Client Component (`"use client"`)
  only when it needs interactivity — forms, the pantry table, the generator, the meal-planner
  grid, anything reading from a Zustand store. Push the boundary as low as possible.
- **All authenticated reads/writes go through the shared axios instance** (`@lib/axios.config`)
  to feature **services** (`features/*/api/*.service.ts`). Services return typed domain data;
  the interceptor owns 401-refresh, 403, and 5xx. Components never call `axios()`/`fetch`
  directly.
- **Auth** rides on HTTP-only cookies (`access_token` short-lived, `refresh_token`
  long-lived). The axios instance uses `withCredentials: true`; on 401 it single-flights a
  refresh and replays the request, redirecting to `/login` on failure.
- **AI generation:** the generator page collects pantry + active filters and calls
  `POST /api/recipes/generate`. NestJS builds the prompt, calls Gemini 2.5 Flash, parses the
  structured response, and returns a recipe object. The client renders it; saving is a
  separate `POST /api/recipes`.

---

## Invariants

Rules the AI agent must never violate:

- The **frontend never** holds secrets, talks to the database, or calls Gemini directly. The
  `GEMINI_API_KEY` and DB credentials are **backend-only**.
- The **AI provider is Google Gemini 2.5 Flash** (`gemini-2.5-flash`). Do not introduce
  Anthropic/OpenAI or call an LLM from the client.
- Every API route except the auth endpoints is **per-user**: scope every query to the
  authenticated `userId`; never trust an id supplied by the client/model.
- **Never select, return, or log `passwordHash`.** Hash with bcryptjs on register/change;
  compare on login.
- Frontend: `src/app/*` holds route entries only — compose feature components; no business
  logic in pages/layouts. A feature never imports another feature's internals; `shared` never
  imports from `features`/`app`.
- All cross-cutting frontend HTTP goes through the shared axios instance and feature services
  — never a bare `fetch`/`axios()` in a component.
- Backend: one **module per domain** under `src/modules/`; controllers thin, services hold
  logic. Every request body is a validated DTO (`whitelist: true, transform: true`).
- **Module boundaries:** `common/` and `prisma/` never import from `modules/`; a module never
  imports another module's internals — only its exported service via the Nest module system.
- **Config is validated at boot** — the app refuses to start on missing/invalid env
  (`DATABASE_URL`, JWT secrets, `GEMINI_API_KEY`). Read config via `ConfigService`, not
  `process.env`, in feature code.
- **Secure by default** — a global `JwtAuthGuard` protects every route; only routes marked
  `@Public()` (register/login/refresh, health) are open. The `userId` always comes from the
  verified JWT via `@CurrentUser()`, never from the client.
- **Errors stay in the envelope** — `PrismaExceptionFilter` maps DB errors (P2002→409,
  P2025→404) and `AllExceptionsFilter` catches the rest; both emit `{ success: false, message }`
  and never leak internals. helmet + rate limiting are always on.
- Dark theme only — every surface uses the semantic tokens (see ui-tokens.md). No hardcoded
  hex or raw Tailwind color classes in components.
- Do not add payments, social features, or store integrations — none are in scope.
</content>

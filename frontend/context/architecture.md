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
| Validation   | class-validator / class-transformer | Request DTO validation                                      |
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

## Backend Module Layout

```
backend/src/
├── main.ts                  → bootstrap: ValidationPipe, cookie-parser, CORS, setGlobalPrefix("api")
├── prisma/                  → PrismaService (extends PrismaClient)
├── auth/                    → register/login/refresh/logout, JwtStrategy, guards
├── users/ (preferences)     → GET/PUT default diet + cuisine
├── pantry/                  → CRUD pantry items; expiry + low-stock derivation
├── recipes/
│   ├── recipes.*            → save / list / search / filter saved recipes
│   └── ai/                  → Gemini service: prompt build → generate → parse → return
├── meal-planner/            → weekly entries by slot; week navigation queries
└── shopping/                → list CRUD; "add to pantry" promotion
prisma/
├── schema.prisma
├── migrations/
└── seed.ts                  → enum reference data / sample pantry (optional)
```

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
- Backend: one **module per domain**; controllers thin, services hold logic. Every request
  body is a validated DTO (`whitelist: true, transform: true`).
- Dark theme only — every surface uses the semantic tokens (see ui-tokens.md). No hardcoded
  hex or raw Tailwind color classes in components.
- Do not add payments, social features, or store integrations — none are in scope.
</content>

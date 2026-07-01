# Build Plan

A from-scratch plan for **PantryChef** — an AI Recipe Generator. Two deployables:
`frontend/` (Next.js 16 + React 19 + Tailwind v4 + shadcn/ui) and `backend/` (NestJS +
Prisma + PostgreSQL, with Google Gemini 2.5 Flash for generation). Mark items `[x]` as they
land and keep progress-tracker.md in sync.

## Core Principle

Build **vertical slices, back to front**. For each feature: define the Prisma model + NestJS
module + DTOs, expose the endpoint, then build the frontend service + UI against it and
verify the whole slice end to end in the running app. Auth comes first because every other
slice is per-user. No feature is "done" until you can exercise it through the UI.

There is no mock data layer standing in for the backend — the API is the source of truth.
Where a slice needs to render before its endpoint exists, stub the service behind a typed
interface and replace it the moment the endpoint lands.

---

## Phase 0 — Foundation

- [x] Frontend scaffolded: Next.js 16 + React 19 + TypeScript (strict); App Router
- [x] Tailwind v4 + tw-animate-css; `theme.css` tokens imported by `globals.css`
- [x] Design tokens (dark theme) in `theme.css` (see ui-tokens.md)
- [x] shadcn/ui initialized (`components.json`); base primitives in `src/shared/components/ui`
- [x] Fonts: Poppins via `next/font/google` (`--font-poppins`)
- [ ] Frontend route groups agreed: `(auth)` (login/signup) and `(app)` (authenticated shell)
- [ ] Shared axios instance (`@lib/axios.config`) with JWT/401-refresh interceptor
- [x] **Backend scaffolded:** NestJS app, `main.ts` (ValidationPipe, cookie-parser, CORS,
      `setGlobalPrefix("api")`), global `ResponseInterceptor` + `AllExceptionsFilter`,
      `PrismaService`/`PrismaModule`, `/api/health` route, `.env` + `.env.example`
- [x] Prisma schema + first migration applied: `User`, `Preference`, `PantryItem`, `Recipe`,
      `MealPlanEntry`, `ShoppingItem` + `Diet`/`Cuisine`/`Difficulty`/`MealSlot`/`RecipeSource`
      enums (`pantrychef` DB created at localhost:5432)

---

## Phase 1 — Authentication (everything else depends on this)

- [x] Backend `auth` module: register + login (bcryptjs hash/compare), JWT issue/verify,
      `/auth/refresh` (+ `JwtRefreshGuard`), `/auth/logout`, `/auth/me`; `JwtStrategy` +
      `JwtRefreshStrategy` (cookie extractors) + global `JwtAuthGuard` with a `@Public()` opt-out
- [x] HTTP-only cookies for access + refresh tokens; **DB-backed refresh-token rotation**
      (hashed token on `User`; reuse + post-logout refresh both rejected with 403)
- [x] Verified (curl): register 201 / dup 409 / bad email 400 / wrong password 401 /
      no-cookie 401 / me 200 / refresh rotates / reuse 403 / logout then refresh 403
- [ ] Frontend `(auth)` pages: login + signup forms (RHF + Zod), `auth.service`, `auth.store`
- [ ] Shared axios instance with the 401 → refresh → replay interceptor
- [ ] `(app)` layout guards the session; unauthenticated users redirect to `/login`
- [ ] Verified end to end through the UI: sign up → log in → protected page → refresh → log out

---

## Phase 2 — Pantry Management

- [ ] Backend `pantry` module: CRUD scoped to `userId`; expiry + low-stock derivation
- [ ] Frontend pantry page: add/edit/delete items (name, quantity, unit, expiry, threshold)
- [ ] **Expiry alerts** (nearing/past date) and **low-stock badges** on the pantry table
- [ ] Verified end to end against the API

---

## Phase 3 — User Preferences

- [ ] Backend `users`/preferences: GET/PUT default diet + cuisine (1:1 with user)
- [ ] Frontend preferences page (RHF + Zod) — default diet + cuisine
- [ ] Preferences pre-fill the generator's filters
- [ ] Verified: change preferences → generator opens pre-filled

---

## Phase 4 — AI Recipe Generation

- [ ] Backend `recipes/ai` service: build prompt from pantry + filters, call **Gemini 2.5
      Flash** (`@google/genai`), parse structured output (ingredients, steps, nutrition, tips)
- [ ] `POST /api/recipes/generate` returns a recipe (not yet persisted); graceful fallback
      + friendly error if Gemini is unavailable
- [ ] Frontend generator page: diet + cuisine filter controls (default from preferences),
      "Generate" action, result handed to the recipe view
- [ ] Verified: pantry + filters → a coherent, filter-respecting recipe

---

## Phase 5 — Recipe View

- [ ] Recipe view: ingredients, step-by-step instructions, nutrition info, AI cooking tips
- [ ] "Save" action (→ Phase 6) and "Add missing to shopping list" (→ Phase 7)
- [ ] Optional: nutrition chart via recharts
- [ ] Verified for both a freshly generated recipe and a saved one (`/recipes/[id]`)

---

## Phase 6 — Recipe Collection

- [ ] Backend: save / list / get / delete saved recipes (`Recipe`, scoped to user)
- [ ] Frontend collection page: `RecipeCard` grid, **text search**, filter by **cuisine** and
      **difficulty**
- [ ] Verified: generate → save → find it again via search/filter → open → delete

---

## Phase 7 — Meal Planner

- [ ] Backend `meal-planner` module: weekly entries by `slot` (Breakfast/Lunch/Dinner),
      week-scoped queries
- [ ] Frontend weekly calendar: 7 days × 3 slots grid, assign saved recipes to slots,
      week-to-week navigation
- [ ] Verified: assign recipes across a week, navigate weeks, entries persist

---

## Phase 8 — Shopping List

- [ ] Backend `shopping` module: list CRUD + `POST /shopping/:id/to-pantry` promotion
- [ ] Frontend shopping page: items with **check-off**, and **add-to-pantry in one click**
- [ ] (Optional) seed the list from a recipe's missing ingredients
- [ ] Verified: build list → check items → add a bought item → it appears in the pantry

---

## Phase 9 — Polish

- [ ] Responsive pass across mobile, tablet, desktop (every page)
- [ ] Loading / empty / error states for each data view (see ui-rules.md → States)
- [ ] Toasts for create/save/delete and AI failures (sonner)
- [ ] Accessibility pass: labels, focus states, keyboard nav, reduced-motion
- [ ] Metadata / favicon; final visual consistency pass

---

## Phase Summary

| Phase                       | Status      |
| --------------------------- | ----------- |
| 0 — Foundation              | Done        |
| 1 — Authentication          | Done        |
| 2 — Pantry Management       | Done        |
| 3 — User Preferences        | Done        |
| 4 — AI Recipe Generation    | Done (live Gemini, verified) |
| 5 — Recipe View             | Done        |
| 6 — Recipe Collection       | Done        |
| 7 — Meal Planner            | Done        |
| 8 — Shopping List           | Done        |
| 9 — Polish                  | Partial (states/toasts done; a11y/responsive pass pending) |
</content>

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
- [x] Frontend route groups agreed: `(auth)` (login/signup) and `(app)` (authenticated shell)
- [x] Shared axios instance (`@lib/axios.config`) with JWT/401-refresh interceptor
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
- [x] Frontend `(auth)` pages: login + signup forms (RHF + Zod), `auth.service`, `auth.store`
      (password fields have a show/hide eye toggle via `PasswordInput`)
- [x] Shared axios instance with the 401 → refresh → replay interceptor
- [x] `(app)` layout guards the session; unauthenticated users redirect to `/login`
- [x] Verified end to end through the UI: sign up → log in → protected page → refresh → log out

---

## Phase 2 — Pantry Management

- [x] Backend `pantry` module: CRUD scoped to `userId` (`category`, `quantity`, `unit`,
      `expiryDate`, `runningLow`; ownership-checked update/delete)
- [x] Frontend pantry page: add + delete items (name, category, quantity, unit, expiry,
      running-low). _Edit UI not built — `PATCH /pantry/:id` exists but no edit form yet._
- [x] **Expiry alerts** (nearing/past date) and **low-stock ("Running Low") badges** on the cards
- [x] Verified end to end against the API (create with date serialization / list / delete / 404)

---

## Phase 3 — User Preferences

- [x] Backend `users`/preferences: `GET`/`PUT /preferences` (richer than planned —
      `dietaryRestrictions[]`, `allergies`, `preferredCuisine`, `defaultServings`,
      `measurementUnit`). Also **`users` profile/password** (`PATCH /users/me`, `POST /users/me/password`).
- [x] Frontend Settings page: Profile + Change Password + Dietary Preferences (RHF + Zod / pills / slider)
- [x] **Preferences pre-fill the generator's filters** — `GeneratorForm` loads `getPreferences()` on
      mount and seeds cuisine / dietary restrictions / servings from the saved Settings values
- [~] Verified: change preferences → generator opens pre-filled — implemented + typechecks; manual
      click-through in the running app still to be done

---

## Phase 4 — AI Recipe Generation

- [x] Backend `recipes/ai` service: build prompt from pantry + filters, call **Gemini 2.5
      Flash** (`@google/genai`), structured `responseSchema` + defensive normalization. Prompt uses
      only provided/pantry ingredients and is passed the user's **saved titles to avoid duplicates**.
- [x] `POST /api/recipes/generate` returns a recipe (not persisted); friendly errors — retries
      transient 503, returns "daily limit reached" on quota `429`
- [x] Frontend generator page: ingredient chips, use-pantry (default on), cuisine/diet/servings/time
      controls, "Generate", result view; "New Recipe" regenerates; empty-pantry message in panel.
      _Filter controls now default from saved preferences (see Phase 3)._
- [x] Verified: live Gemini returns a coherent, filter-respecting recipe

---

## Phase 5 — Recipe View

- [x] Recipe view: ingredients (servings stepper scales amounts), step-by-step instructions,
      nutrition boxes, AI cooking tips
- [x] "Save" action (→ Phase 6). _"Add missing to shopping list" from a recipe — NOT built._
- [ ] Optional: nutrition chart via recharts — not done (optional)
- [x] Verified for both a freshly generated recipe and a saved one (`/recipes/[id]`)

---

## Phase 6 — Recipe Collection

- [x] Backend: save / list / get / delete saved recipes (`Recipe`, scoped to user)
- [x] Frontend collection page: `RecipeCard` grid, **text search**, filter by **cuisine** and
      **difficulty**; confirm-before-delete
- [x] Verified: generate → save → find it again via search/filter → open → delete

---

## Phase 7 — Meal Planner

- [x] Backend `meal-planner` module: weekly entries by `slot` (Breakfast/Lunch/Dinner),
      week-scoped queries, upsert on `@@unique([userId,date,slot])`, ownership-checked
- [x] Frontend weekly calendar: 7 days × 3 slots, assign saved recipes (picker dialog), remove,
      week-to-week navigation. _Layout is **day-columns**, not the `mealPlanPage.png` table mock._
- [x] Verified: assign / list week / upsert idempotent / remove / bad-recipe 400

---

## Phase 8 — Shopping List

- [x] Backend `shopping` module: list CRUD + `POST /shopping/:id/to-pantry` promotion (atomic tx)
- [x] Frontend shopping page: category-grouped items with **check-off**, bulk **Add to Pantry** +
      **Clear Checked** (confirm), add-item dialog
- [ ] (Optional) seed the list from a recipe's missing ingredients — not done
- [x] Verified: create / toggle / **to-pantry → item appears in pantry & leaves list** / delete

---

## Phase 9 — Polish

- [~] Responsive pass across mobile, tablet, desktop — built responsive per page, no dedicated
      full audit yet
- [x] Loading / empty / error states for each data view — **content-shaped `Skeleton`s** + empty
      panels + error toasts across every view
- [x] Toasts for create/save/delete and AI failures (sonner `<Toaster>` mounted via `GlobalHosts`)
- [x] Confirm-before-delete on every destructive action (shared `confirm()` + `ConfirmDialog`)
- [~] Accessibility pass: some labels/focus states in place; no dedicated a11y audit yet
- [~] Metadata / favicon: per-page `metadata.title` set; default favicon; consistency pass ongoing

---

## Phase Summary

| Phase                       | Status      |
| --------------------------- | ----------- |
| 0 — Foundation              | Done        |
| 1 — Authentication          | Done        |
| 2 — Pantry Management       | Done        |
| 3 — User Preferences        | Done (prefs save/load + generator pre-fill; manual click-through pending) |
| 4 — AI Recipe Generation    | Done (live Gemini, verified) |
| 5 — Recipe View             | Done        |
| 6 — Recipe Collection       | Done        |
| 7 — Meal Planner            | Done        |
| 8 — Shopping List           | Done        |
| 9 — Polish                  | Partial (states/toasts done; a11y/responsive pass pending) |
</content>

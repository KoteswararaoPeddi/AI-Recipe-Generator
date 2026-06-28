# Progress Tracker

Update this file after every completed feature/slice. Any AI agent reading this should
immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** 1 — Authentication **done** (backend). Frontend is scaffolded; the **backend now
has the full production structure** (`config/` · `common/` · `prisma/` · `modules/`) and a
working, verified auth system. No other feature module exists yet. The remaining feature list
in project-overview.md is the target, not the current state.

**Done:**

- **Frontend scaffold.** Next.js 16 + React 19 + TypeScript (strict), App Router. Tailwind
  v4 + tw-animate-css; `globals.css` imports `src/shared/styles/theme.css`. shadcn/ui
  initialized (`components.json`) with base primitives under `src/shared/components/ui`
  (Button, Card, Input, Badge, Label, Textarea, Field, Separator, Typography). *Not all are
  used yet — keep what features need; add others via the shadcn CLI when required.*
- **Theme.** Dark token system in `theme.css` (emerald-teal primary on charcoal neutrals;
  see ui-tokens.md). Dark only; no theme toggle.
- **Fonts.** Poppins via `next/font/google` (`--font-poppins`) wired into the root layout.
- **Portfolio scaffold removed (cleanup done).** Deleted the `(customer)` route group +
  `Navbar`/`Footer`/`Logo`/`navigation.config`/`SocialIcons`, the orphan `sanity.config.ts`,
  and uninstalled the unused `sanity`/`next-sanity`/`@sanity/vision`/`resend` deps. Root
  `layout.tsx` metadata fixed to PantryChef; `.env.local` trimmed to `NEXT_PUBLIC_API_URL`.
- **Frontend auth slice (Phase 1 client).** `(auth)` route group: `/login` + `/signup` (thin
  Server Components) rendering `LoginForm`/`SignupForm` (`"use client"`, RHF + Zod, inline field
  errors + **sonner toast** feedback (`toast.loading` → success/error), submitting state). A
  dark `Toaster` (`ui/sonner.tsx`) is mounted in the root layout. `features/auth/` = `schemas/`
  + `api/auth.service.ts`
  (shared axios instance) + `types/`; `@lib/get-error-message.ts` unwraps the error envelope.
- **LIGHT THEME (default).** `theme.css` `:root` flipped from dark to **light** (white surfaces,
  slate text, emerald-teal primary) to match the design mock. The `.dark` block remains as a
  future override (no toggle wired). This relights the whole app (auth pages included) since
  everything uses semantic tokens. ⚠️ Deviates from the old "dark only" decision — done at the
  developer's request; ui-tokens.md updated to match.
- **Protected `(app)` shell + dashboard (design-matched).** `app/page.tsx` (`/`) redirects to
  `/login`. `(app)/layout.tsx` (Server) wraps the **client** `AppShell` — session guard + a full
  **top navbar** (logo "AI Recipe Generator", nav links Dashboard/Pantry/Generate/Recipes/Meal
  Plan/Shopping with active state from `usePathname`, settings gear, `UserMenu` dropdown with
  sign out). Nav config in `shared/config/app-nav.ts`. `(app)/dashboard/page.tsx` (Server) matches
  the mock: heading, **3 stat cards** (`StatCard`: green/blue/purple wells), **2 action cards**
  (`ActionCard`; Generate highlighted), **Recent Recipes** + **Upcoming Meals** lists — all in
  `features/dashboard/` with **mock data** (`data/dashboard.data.ts`) until the real APIs exist.
  Nav targets generate/recipes/meal-plan/shopping/settings are **`ComingSoon` stubs** so
  links don't 404. Login/signup → `/dashboard`; sign out → `/login`.
- **Pantry page (design-matched, `features/pantry`).** `/pantry` is now real (not a stub):
  header + "Add Item", an **Items Expiring Soon** alert, a **search + category-pill** filter bar,
  and a **grid of item cards** (name, category, ✕ delete, quantity, expiry — red when expired,
  "Running Low" chip). **Add Pantry Item dialog** (shadcn `Dialog` + `Select` + `Checkbox`, RHF +
  Zod). `PantryView` (client) holds items/search/category/dialog state. **Mock data** with
  client-side add/delete/filter until the `/pantry` API (Phase 2 backend) exists. `npm run build`
  clean (11 routes).
- **Generate page (design-matched, `features/generator` + `features/recipes`).** `/generate` is
  real: centered hero + a 2-column layout — left `GeneratorForm` (ingredient input + chips, "use
  pantry" `Checkbox`, cuisine `Select`, dietary pills, **servings `Slider`** (shadcn-installed),
  cooking-time pills, "Generate Recipe"); right `RecipeResult` (title, description, colored tags,
  time/servings, ingredients, numbered steps, nutrition stat boxes, Cooking Tips, Save/New) or an
  empty/loading state. **Mock generate** returns `SAMPLE_RECIPE` after a short delay (no Gemini
  backend yet). Shared `Recipe` type + mock in `features/recipes/`. All text via `Typography`;
  Select/Checkbox/Slider are installed shadcn. `npm run build` clean (12 routes).
- **Recipes list + detail (design-matched, `features/recipes`).** `/recipes` is real: "My Recipes"
  header + a **search + cuisine/difficulty `Select`** filter bar, "Showing X of Y" count, and a
  **grid of `RecipeCard`s** (gradient chef-hat media well, title link, clamped description,
  cuisine/difficulty/diet tags, mins + calories, View Recipe + delete). `/recipes/[id]` (Server,
  `await`s async `params`, `getSavedRecipe` → `notFound()`) renders client `RecipeDetailView`:
  back-link, header card (title, delete, tags, total + prep/cook time), then **Ingredients**
  (servings stepper that **scales amounts** via `lib/scale-amount.ts`, checkable rows) +
  **Instructions** (numbered steps), Nutrition boxes, and Cooking Tips. Shared `RecipeTags`
  centralizes tag tones (cuisine=primary, difficulty by level, diet=purple). `Recipe` type extended
  with optional `dietTags`/`prepMinutes`/`cookMinutes` (additive). **Mock data** (`SAVED_RECIPES`,
  6 recipes) with client-side delete until the `/recipes` API (Phase 6) exists. `npm run build`
  clean (13 routes).
- **Meal Planner (UI/UX, `features/meal-planner`).** `/meal-plan` is real (no design mock existed —
  designed to the system): a **week-nav bar** (prev/next + "This Week", Monday-anchored range via
  `lib/week.ts`) and a responsive **7-day × 3-slot grid** (day columns; stacks 1→2→7 cols). Empty
  slots are dashed "+ Add" buttons that open a **`RecipePickerDialog`** (searchable list of
  `SAVED_RECIPES`); filled slots show the recipe title + mins with an ✕ remove. Plan is **in-memory**
  (`Record<\`${iso}-${slot}\`, Recipe>`) until the `/meal-planner` API (Phase 7). Slots mirror the
  backend `MealSlot` enum (Breakfast/Lunch/Dinner).
- **Shopping List (design-matched `shoppingList.png`, `features/shopping`).** `/shopping` is real:
  header + dynamic "**X of Y items checked**" subtitle (no progress bar), a **global action toolbar**
  (**Add Item** primary always; **Add to Pantry (N)** blue/`info` + **Clear Checked** outline, both
  shown only when items are checked), and items **grouped into category cards** (header band + rows
  in `divide-y`) as clean `ShoppingItemRow`s (checkbox + name/qty, strike-through when checked, no
  per-row buttons). **Add Item** opens `AddShoppingItemDialog` (shadcn `Dialog` + RHF + Zod, mirrors
  Pantry). Bulk "Add to Pantry" promotes all checked items (toast + remove). **Mock** `SHOPPING_ITEMS`
  (7 items, Dairy/Meat/Produce) client-side until the `/shopping` API + `to-pantry` promotion
  (Phase 8). `npm run build` clean (13 routes).
  > Note: an earlier first pass (progress bar + inline add bar + per-row buttons) was reworked to the
  > real `shoppingList.png` mock once it was provided.
- **Settings page (design-matched `settingspage1-3.png`, `features/settings`).** `/settings` is real:
  a `max-w-3xl` stack of three independent cards — **Profile Information** (green `User` well; RHF+Zod
  Name/Email prefilled from `useAuthStore`; Save Profile), **Change Password** (blue `Lock` well; RHF+Zod
  current/new/confirm with match `.refine`; blue Change Password button), and **Dietary Preferences**
  (multi-select restriction pills `DIETS`, allergies text input, single-select cuisine pills `CUISINES`,
  servings `Slider` 1–12, Metric/Imperial segmented toggle; Save Preferences). Each section owns its
  Save + toast (no orchestrator). Reuses the auth form pattern + the generator's `DIETS`/`CUISINES`
  constants and pill/Slider patterns. All saves are **mock** (toast) until the Phase 3 users/preferences
  endpoints exist. `npm run build` clean (13 routes). **All `(app)` pages are now built.**
  > Units reuse: extracted the shared `@shared/constants/units.ts` (`MEASUREMENT_UNITS`) — pantry +
  > shopping both consume it (pantry re-exports it as `PANTRY_UNITS`), instead of duplicating the list.
- **Rule added: install shadcn, don't hand-roll; text uses `Typography`.** code-standards.md now
  mandates installing shadcn primitives via the CLI (`npx shadcn@latest add ...`) instead of
  hand-writing components shadcn provides, and routing all content text through `Typography`.
  Installed `dialog`/`select`/`checkbox` this way. (The earlier dashboard uses raw `text-*`
  classes — retrofit to `Typography` when next touched.)
- **Cross-cutting auth state (Zustand).** `shared/stores/auth.store.ts` (`zustand` installed) —
  `{ user, status, setUser, clearUser }`; the canonical `AuthUser` type now lives in
  `shared/types/auth.types.ts`. **Two hydration paths:** (1) `LoginForm`/`SignupForm` seed the
  store with `setUser(user)` from their response at sign-in — this is **load-bearing**, not an
  optimization: it establishes auth state at login so the dashboard renders immediately after
  `router.push("/dashboard")` (without it, the dashboard relied on an after-navigation `getMe`
  that races and gets stuck on "loading" until a manual refresh). (2) `AppShell` runs `getMe` on
  mount **only when status is still `loading`** (refresh / direct visit) — the rehydration path.
  `SignOutButton` clears it. Read the user anywhere via `useAuthStore((s) => s.user)`. UX-only —
  backend stays the source of truth.
- **Backend foundation (NestJS).** `backend/` scaffolded (NestJS 11): `main.ts` with
  `ValidationPipe({ whitelist, transform })`, `cookie-parser`, CORS (`credentials: true`,
  origin from `CORS_ORIGIN`), `setGlobalPrefix("api")`. Global `ResponseInterceptor`
  (`{ success, message, data }`) + `AllExceptionsFilter` (`{ success: false, message }`).
  `ConfigModule` global. Runs on **port 3001**. Verified: `GET /api/health` → 200
  `{...,"data":{"status":"ok","db":"up"}}`; unknown route → 404 `{success:false,...}`.
- **Database (Prisma + PostgreSQL).** `prisma/schema.prisma` with all six models (User,
  Preference, PantryItem, Recipe, MealPlanEntry, ShoppingItem) + enums (Diet, Cuisine,
  Difficulty, MealSlot, RecipeSource). `PrismaService`/`PrismaModule` (global). Migration
  `init` applied — `pantrychef` DB created at localhost:5432, all tables live. Client v6.19.3.
- **Env.** `backend/.env` (gitignored) holds `DATABASE_URL` (working), **real generated JWT
  secrets** (`JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` + `*_TTL`), and the Gemini key slot;
  `backend/.env.example` documents all keys. Root `.gitignore` protects every `.env`.
- **Production structure applied.** Backend is now the four-layer layout: `src/config/`
  (configuration + `env.validation` — **boot-time validation** wired via
  `ConfigModule.forRoot({ validate })`), `src/common/` (decorators `@Public`/`@CurrentUser`,
  guards `JwtAuthGuard` global + `JwtRefreshGuard`, filters `PrismaExceptionFilter` +
  `AllExceptionsFilter`, `ResponseInterceptor`), `src/prisma/`, and `src/modules/`. `main.ts`
  adds **helmet**, **`@nestjs/throttler`** (global, 100/min), and `enableShutdownHooks()`.
  `health/` moved under `modules/health`. (Structured pino logging is documented but **not yet
  wired** — still on the default Nest logger; add when needed.)
- **Authentication (Phase 1) — `modules/auth` + `modules/users`.** JWT access + refresh in
  HTTP-only cookies, bcryptjs password hashing, **DB-backed refresh-token rotation** (a
  bcrypt(SHA-256(token)) hash stored on `User.hashedRefreshToken`). `JwtStrategy` (access,
  cookie) + `JwtRefreshStrategy` (refresh, cookie). Endpoints, all verified end-to-end with
  curl:
  - `POST /api/auth/register` (201, `@Public`) — creates user + default preferences, sets cookies
  - `POST /api/auth/login` (200, `@Public`)
  - `POST /api/auth/refresh` (200, `@Public` + `JwtRefreshGuard`) — rotates the pair
  - `POST /api/auth/logout` (200) — clears cookies + nulls stored hash
  - `GET /api/auth/me` (200) — current user
  Verified behaviors: bad email → 400; duplicate → 409; wrong password / no-cookie → 401;
  **reusing a rotated refresh token → 403**; **refresh after logout → 403**. No `passwordHash`
  or `hashedRefreshToken` ever serialized out (services use a `SAFE_USER_SELECT`).

**Not started (everything else product-facing):**

- **Feature pages under `(app)`** — Pantry, Generate, Recipes, Meal planner, Shopping list,
  Preferences (the dashboard cards are placeholders, not yet linked to real pages). A real nav
  (sidebar/top-nav with links) can come when these land — the `auth.store` already exists.
- Backend **feature modules**: users/preferences endpoints, pantry, recipes + Gemini,
  meal-planner, shopping — see build-plan.md phases 2–8.

**Next:** **Phase 2 (Pantry)** — the first per-user CRUD slice (backend `pantry` module +
frontend `(app)/pantry` page). That makes the first dashboard card real, end to end.

> **Known issue (non-blocking):** `npm audit` reports 3 high-severity advisories in `multer`
> (transitive via `@nestjs/platform-express`), DoS-on-upload only. PantryChef has no upload
> routes, so it's not exploitable. **Do not** run `npm audit fix --force` — it downgrades
> `@nestjs/core` to 7.5.5 and breaks the install. Resolve via an upstream bump / override later.
> Also: Prisma warns that `package.json#prisma` config is deprecated (fine on v6; migrate to
> `prisma.config.ts` before any Prisma 7 upgrade).

> **Portfolio scaffold cleanup — DONE.** The `(customer)` group, `Navbar`/`Footer`/`Logo`,
> `navigation.config`, `SocialIcons`, and orphan `sanity.config.ts` were removed; metadata and
> `.env.local` cleaned; `sanity`/`resend` deps uninstalled. The frontend is now PantryChef-only.
> **Dev-server tip:** deleting files while `next dev` is running corrupts the Turbopack `.next`
> cache and can OOM on restart — if a fatal "out of memory" / "can't resolve" appears, stop all
> dev servers, `rm -rf .next`, and start a single `npm run dev`.

---

## Progress

See build-plan.md for the full per-phase breakdown.

- [~] Phase 0 — Foundation (frontend scaffold + tokens + fonts done; route groups, axios
  instance, backend scaffold, and Prisma schema pending)
- [x] Phase 1 — Authentication (backend: register/login/refresh/logout/me, rotation, guards)
- [ ] Phase 2 — Pantry Management
- [ ] Phase 3 — User Preferences
- [ ] Phase 4 — AI Recipe Generation
- [ ] Phase 5 — Recipe View
- [ ] Phase 6 — Recipe Collection
- [ ] Phase 7 — Meal Planner
- [ ] Phase 8 — Shopping List
- [ ] Phase 9 — Polish

---

## Decisions Made During Build

- **Stack:** Frontend — Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind v4
  + shadcn/ui. Backend — NestJS + Prisma + PostgreSQL. The frontend talks only to the NestJS
  REST API; it never touches the DB or the AI provider directly.
- **AI provider:** **Google Gemini 2.5 Flash** (`gemini-2.5-flash`, `@google/genai`), called
  **server-side in NestJS**. `GEMINI_API_KEY` is backend-only, never `NEXT_PUBLIC_`.
- **Auth:** JWT (access + refresh) in **HTTP-only cookies**; passwords hashed with
  **bcryptjs**. Frontend axios uses `withCredentials: true`; the interceptor single-flights
  the refresh on 401.
- **Persistence:** generated recipes are returned to the client and **persisted only when the
  user saves** them. Every row is scoped to the authenticated `userId`.
- **Theme:** dark only (emerald-teal / charcoal). No light mode, no toggle.
- **Fonts:** Poppins (`next/font/google`).

---

## Notes

_Add notes here as the build progresses — workarounds, patterns, anything that differs from
the context files._

> **Backend conventions — now applied (Phase 1).** The four-layer structure (`config/` /
> `common/` / `prisma/` / `modules/`), boot-time config validation, global `JwtAuthGuard` +
> `@Public`/`@CurrentUser`, `PrismaExceptionFilter`, helmet, `@nestjs/throttler`, and
> `enableShutdownHooks` are implemented as of the auth slice. **Still pending** from the
> documented hardening: structured **nestjs-pino logging + `LoggingInterceptor`** (deps
> installed, not yet wired — on the default Nest logger), the **entity/`@Exclude` output layer**
> (services currently use a `SAFE_USER_SELECT` instead), and the **unit + e2e test suite**. Wire
> these as the feature phases land.

> **tailwind-merge / custom type scale:** `cn()` in `src/shared/lib/utils.ts` registers the
> custom `text-*` size tokens with `extendTailwindMerge` so size classes (`text-h2`) are not
> conflated with colour classes (`text-foreground`) and dropped. Any new `text-size` token
> added to `theme.css` must also be added to that list.
</content>

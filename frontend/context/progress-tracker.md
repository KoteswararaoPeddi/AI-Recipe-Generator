# Progress Tracker

Update this file after every completed feature/slice. Any AI agent reading this should
immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** 0 — Foundation. The **frontend is scaffolded** and the **backend foundation is
built and running** (NestJS + Prisma + PostgreSQL, migrated). **No product feature module is
built yet.** The feature list in project-overview.md is the target, not the current state.

**Done:**

- **Frontend scaffold.** Next.js 16 + React 19 + TypeScript (strict), App Router. Tailwind
  v4 + tw-animate-css; `globals.css` imports `src/shared/styles/theme.css`. shadcn/ui
  initialized (`components.json`) with base primitives under `src/shared/components/ui`
  (Button, Card, Input, Badge, Label, Textarea, Field, Separator, Typography). *Not all are
  used yet — keep what features need; add others via the shadcn CLI when required.*
- **Theme.** Dark token system in `theme.css` (emerald-teal primary on charcoal neutrals;
  see ui-tokens.md). Dark only; no theme toggle.
- **Fonts.** Poppins via `next/font/google` (`--font-poppins`) wired into the root layout.
- **Layout shell (placeholder).** Root `layout.tsx` + a `(customer)` route group with a
  placeholder `page.tsx`, `Navbar`, `Footer`, `Logo`. **These carry stale portfolio naming
  and will be replaced** by the `(auth)` and `(app)` route groups from architecture.md.
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
- **Env.** `backend/.env` (gitignored) holds `DATABASE_URL` (working), placeholder JWT secrets,
  and the Gemini key slot; `backend/.env.example` documents all keys. Root `.gitignore`
  protects every `.env`.

**Not started (everything product-facing):**

- Shared **frontend axios instance** + JWT/401-refresh interceptor.
- Backend **feature modules**: auth, pantry, preferences, recipes + Gemini, meal-planner,
  shopping — see build-plan.md phases 1–8.

**Next:** Phase 1 — Authentication (auth module: register/login/refresh/logout with bcryptjs +
JWT cookies, `JwtStrategy` + global guard), then the frontend `(auth)` pages and axios
instance. Every other slice is per-user, so auth comes first.

> **Known issue (non-blocking):** `npm audit` reports 3 high-severity advisories in `multer`
> (transitive via `@nestjs/platform-express`), DoS-on-upload only. PantryChef has no upload
> routes, so it's not exploitable. **Do not** run `npm audit fix --force` — it downgrades
> `@nestjs/core` to 7.5.5 and breaks the install. Resolve via an upstream bump / override later.
> Also: Prisma warns that `package.json#prisma` config is deprecated (fine on v6; migrate to
> `prisma.config.ts` before any Prisma 7 upgrade).

> **Scaffold cleanup needed:** the current `(customer)` route group, placeholder home
> `page.tsx`, `Navbar`/`Footer`/`Logo`, and any `navigation.config` were generated from an
> unrelated portfolio template. Replace/repurpose them for the recipe app rather than building
> on the portfolio framing.

---

## Progress

See build-plan.md for the full per-phase breakdown.

- [~] Phase 0 — Foundation (frontend scaffold + tokens + fonts done; route groups, axios
  instance, backend scaffold, and Prisma schema pending)
- [ ] Phase 1 — Authentication
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

> **tailwind-merge / custom type scale:** `cn()` in `src/shared/lib/utils.ts` registers the
> custom `text-*` size tokens with `extendTailwindMerge` so size classes (`text-h2`) are not
> conflated with colour classes (`text-foreground`) and dropped. Any new `text-size` token
> added to `theme.css` must also be added to that list.
</content>

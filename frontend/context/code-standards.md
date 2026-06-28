# Code Standards

Conventions for **PantryChef**. The frontend (Next.js) is the primary surface of these
docs; backend (NestJS) standards live in the relevant sections below and in library-docs.md.
Follow these every session — they prevent pattern drift. See architecture.md for structure.

---

## Engineering Mindset

- **Think before implementing** — understand what and why before writing code.
- **Read context files first** — verify against architecture.md and project-overview.md.
- **Scope is sacred** — build only what the current slice requires.
- **Build vertical slices, back to front** — model + module + endpoint, then service + UI;
  verify the whole slice in the running app before moving on.
- **Every slice must be testable** — if it can't be exercised through the UI/API after
  implementation, it's incomplete.
- **Clean over clever** — simple, readable code a junior can follow beats clever abstractions.
- **Fail gracefully** — handle errors at the boundary; surface human-readable messages; never
  let a promise float. AI failures must never break the rest of the app.
- **Plan for reuse** — decide where logic/UI belongs (feature-local vs. shared) before writing.

---

## TypeScript

- Strict mode is on — no exceptions.
- Never use `any` — use `unknown` and narrow.
- Avoid type assertions (`as`) unless truly necessary, and comment why.
- All function parameters and return types are explicitly typed.
- Use `type` for object shapes/unions; `interface` for extendable shapes (component props).
- All async code handles its errors.
- `const` by default; `let` only when reassignment is required.

---

## Next.js 16 (frontend)

- App Router only. React 19 APIs throughout.
- **This is not the Next.js in your training data** — read `node_modules/next/dist/docs/`
  before using a Next.js-specific feature; heed deprecation notices (see `AGENTS.md`).
- **Server Components by default.** Add `"use client"` only when a component needs
  `useState`/`useEffect`, browser APIs/event listeners, a Zustand store, or a client-only
  library. Forms, the pantry table, the generator, and the meal-planner grid are client
  boundaries. Push the boundary as low in the tree as possible.
- Never add `"use client"` to a layout unless required.
- Pages/layouts in `src/app` stay thin — they compose feature components and hold no business
  logic. Route groups: `(auth)` for login/signup, `(app)` for the authenticated shell.
- Use `next/font` (Poppins), `next/image` for images, and `next/link` for navigation.

### Folder & file architecture (frontend)

- `src/app/*` — route entries only (route groups, layouts, `page.tsx`).
- `src/features/<domain>/` — one vertical slice per domain (`auth`, `pantry`, `generator`,
  `recipes`, `meal-planner`, `shopping-list`, `preferences`). A slice carries only the
  folders it uses: `components/`, `api/` (services), `schemas/` (Zod), `hooks/`, `data/`
  (static option lists only), `types/`. Nest by kebab-case folder + `index.ts` barrel as a
  slice grows.
- **Promote on the second use.** A component used by one feature stays feature-local; promote
  it to `src/shared/components` only once a second feature needs it. `shared` never imports
  from `features`/`app`; a feature never imports another feature's internals.
- `src/shared/` — `components/ui` (shadcn) + shared composites (`Navbar`, `Sidebar`, `Footer`,
  `Logo`), `config/`, `constants/`, `lib/` (`axios.config.ts`, `utils.ts`), `stores/`
  (Zustand), `hooks/`, `types/`, `styles/theme.css`.

---

## Data Fetching & Services (frontend)

- **All authenticated backend calls go through the shared axios instance** (`@lib/axios.config`)
  via feature **services** (`features/<domain>/api/<domain>.service.ts`). Never a bare
  `fetch`/`axios()` in a component.
- Services return **unwrapped, typed domain data** (unwrap the `{ success, message, data }`
  envelope). The interceptor owns 401-refresh, 403, and 5xx — don't reimplement per call.
- A Client Component calls a service in an effect/handler (or via a small data hook); render
  **loading / empty / error** states for every data view (see ui-rules.md → States).

---

## Forms & validation

- Every form uses **React Hook Form + Zod** (both installed): login, signup, pantry item,
  preferences, generator filters. The Zod schema is the **single source of truth**, lives in
  the feature's `schemas/`, and types are derived with `z.infer`.
- Validate before calling a service. Build inputs from the shared form-field components
  (`Field`/`Input`/`Textarea`/`Label`), not raw inputs.
- Always show the form's states: inline validation errors, a disabled/submitting state, and
  success/error feedback (toast via sonner where appropriate).

---

## Client State (Zustand)

- Cross-cutting client state only — e.g. `auth.store` (user/session) and any shared
  pantry/shopping counters used by chrome. Local UI state stays in the component.
- Select narrow slices: `useAuthStore((s) => s.user)`.
- Auth checks in the client are **UX only** — the backend is the authorization source of
  truth (every route scoped to `userId`).

---

## Frontend Performance & Rendering

Learn these in **layers** — foundational habits first, advanced optimizations last. Follow them
in order: the early layers prevent most performance problems before the later ones ever matter.
Some rules are detailed in other sections (cross-referenced). The bundled Next.js docs
(`node_modules/next/dist/docs/`, currently **16.2.7**) outrank memory — re-read the relevant
guide before using a version-specific API (per AGENTS.md).

### Layer 1 — Write good code by default (habits)

The defaults that prevent most performance problems before they start. Make them reflexes.

- **Server Components by default; `"use client"` is the exception** — add it only when a
  component needs state/effects, event handlers, browser APIs, or a client-only library. Server
  Components ship **zero JS**. (See architecture.md → Rendering & Data Flow.)
- **Keep `"use client"` boundaries small** — push them as low as possible; extract the
  interactive leaf (the button), don't make the whole page client.
  `Page(server) → PantryTable(server) → AddItemButton(client)`.
- **Small, single-responsibility, reusable components** — no 800-line `Dashboard.tsx`; split
  into `Header`, `Stats`, `Chart`, … one job, one reason to change. Pages/layouts stay thin.
- **Business logic out of JSX** — extract a 100-line `onClick` into a handler/hook/service.
  Components are **pure and props-driven**. (See Split for Logic & Content, Reuse Before Creating.)
- **Fetch data on the server** when appropriate (async Server Components / services), not in
  `useEffect`. **Don't fetch the same data repeatedly** — fetch once and pass down (see Layers 3–4).
- **`next/image`, `next/font`, `next/script`** — built-in asset optimizations (no CLS, no FOUT,
  scripts off the main thread). Mark only above-the-fold images `priority`.
- **Dynamic-import heavy UI** — `next/dynamic` for the recharts chart, maps, editors, PDF, AI
  chat; load heavy libs on demand with `import()`. Keep them out of first paint.
- **Avoid unnecessary/large dependencies** — can native JS / Next / shadcn already do it? Prefer
  narrow imports (`import { Soup } from "lucide-react"`), never `import *` / barrels.
- **Keep state local** — `useState` where it's used; lift only when shared; global store
  (Zustand) for cross-cutting only, with **narrow selectors**. Don't put fast-changing values in
  **Context**. **Avoid prop drilling** (prefer composition).
- **Stable list keys** (never the array index); `memo`/`useMemo`/`useCallback` only with a
  measured reason (React 19's compiler reduces the need).
- **Clean-code hygiene** — name things well; focused files (`date.ts`/`currency.ts`, not a
  catch-all `utils.ts`); **never expose secrets** to the browser; **never an empty `catch`**.

> Follow Layer 1 consistently and you avoid most common performance issues. The rest is for when
> measurement (Layer 6) shows you actually need it.

### Layer 2 — Understand how Next.js renders

- **`"use client"` is transitive for imports, not for children.** Once a module has
  `"use client"`, everything it *imports and directly renders* joins the client bundle:
  ```tsx
  "use client";
  import Header from "./Header"; // → client bundle
  import Button from "./Button"; // → client bundle
  ```
  But a Server Component passed as **children** stays on the server — it's passed in, not
  imported and rendered inside the boundary:
  ```tsx
  <ClientLayout>
    <ServerProducts /> {/* stays a Server Component */}
  </ClientLayout>
  ```
  Use this children-slot pattern to keep server UI inside a client shell.
- **Context isn't available in Server Components** — put providers in a `"use client"` component
  that takes `children`, rendered **as deep as possible** (wrap `{children}`, not the whole
  document) so static server parts stay optimizable.
- **`server-only` / `client-only`** — import `server-only` in any module holding secrets/DB
  access so it can't be pulled into the client bundle (build-time error). Only `NEXT_PUBLIC_`
  env vars reach the browser; others become `""`.
- **Request-time APIs opt the route into Dynamic Rendering** — `cookies()`, `headers()`,
  `searchParams` make the route dynamic (the whole app if used in the root layout). Use
  intentionally; wrap in `<Suspense>`.

### Layer 3 — Understand caching (the biggest recent change)

Caching behavior has changed across Next.js releases — **verify against the version you're on**;
the bundled docs are the source of truth.

- **`fetch` is NOT cached by default** in Next 16, and an uncached fetch **blocks render** until
  it resolves. Opt in deliberately.
- **Cache Components / `use cache`** (enable `cacheComponents: true` in `next.config.ts`): put
  `"use cache"` atop an async data function (data-level) or a component/page (UI-level); set
  duration with `cacheLife(...)`; arguments + closed-over values form the cache key. (Not using
  Cache Components → follow the "previous model" caching guide.)
- **Per-request dedup** — identical `fetch` calls are auto-memoized within one render; wrap
  non-`fetch` data (Prisma/ORM) in **`React.cache`** so repeated calls in a request share a
  result. Scoped to a single request.

### Layer 4 — Avoid waterfalls

This one habit can cut seconds off load time. **The decision rule:**

- **Sequential** (`await` one after another) **only when the next call depends on the previous
  result.**
- **Parallel** (`Promise.all`) **when the calls are independent.**

A waterfall is sequential `await`s on calls that *don't* depend on each other — that's the bug.
Sequential is correct when there's a genuine data dependency (e.g. you need the artist before you
can fetch their albums).

```tsx
// Bad — independent calls run sequentially (a needless waterfall)
const user = await getUser();
const orders = await getOrders();
const cart = await getCart();

// Good — independent calls start together
const [user, orders, cart] = await Promise.all([getUser(), getOrders(), getCart()]);

// Correct sequential — the second call genuinely needs the first's result
const artist = await getArtist(username);
const albums = await getAlbums(artist.id);
```

- Use **`Promise.allSettled`** when one request may fail and you don't want to lose the others.
- Layouts and pages already render in parallel; the waterfall to kill is **independent
  `await`s placed one after another inside a single component**.
- **Don't call a Route Handler from a Server Component** — needless extra server hop; call the
  data function / DB directly. Route Handlers are for *Client* Components.

### Layer 5 — Streaming

Send UI progressively instead of blocking on the slowest data — users perceive the app as much
faster (header + sidebar render, products stream in).

```tsx
<Suspense fallback={<Loading />}>
  <Products /> {/* streams in; the rest of the page shows immediately */}
</Suspense>
```

- **`loading.js`** wraps a route segment in `<Suspense>` automatically — but a **layout** that
  reads uncached/runtime data **blocks navigation** instead of showing it; wrap that access in
  its own `<Suspense>` or move it into `page.js`.
- **Stream server→client with the `use` API** — pass an *unawaited* promise from a Server
  Component to a Client Component and read it with `use()` inside `<Suspense>`. Don't `await` in
  a layout if you can hand the promise down.
- **`<Link>` auto-prefetches** routes entering the viewport; for client navigations that still
  feel slow, export `unstable_instant` from the route.

### Layer 6 — Measure before optimizing

```
Write → Measure → Find the bottleneck → Optimize → Measure again
```

- **Build → measure → optimize what matters.** Don't spend two hours saving 5 KB, and don't
  guess. Use Lighthouse, React DevTools Profiler, `@next/bundle-analyzer`, and Core Web Vitals
  (LCP / CLS / INP); send Web Vitals to analytics with `useReportWebVitals`. Optimize the slow
  path the tools actually flag, then re-measure.

---

## Backend (NestJS) — production-grade conventions

### Four-layer structure

The backend is a modular monolith with four top-level layers (see architecture.md for the
full tree):

- `src/config/` — typed, **boot-validated** configuration.
- `src/common/` — cross-cutting, domain-agnostic code (decorators, filters, interceptors,
  guards, pipes, shared DTOs). **Imports nothing from `modules/`.**
- `src/prisma/` — the global `PrismaService` / `PrismaModule`.
- `src/modules/<domain>/` — one folder per domain (`auth`, `users`, `pantry`, `recipes`,
  `ai`, `meal-planner`, `shopping`).

**Module boundary rule:** `common/` and `prisma/` never import from `modules/`; a module
never imports another module's internals — only its **exported service** through the Nest
module system. This is non-negotiable — it prevents circular dependencies.

### Module anatomy

Every domain folder has the same shape: `*.module.ts`, `*.controller.ts`, `*.service.ts`,
`dto/`, `entities/`, `*.service.spec.ts`. The discipline:

- **Controllers are thin** — HTTP only: route, pull `@CurrentUser()`, call the service,
  return. No Prisma, no logic. A handler over ~5 lines means logic leaked in.
- **Services own logic and persistence** — they take the authenticated `userId`, scope every
  query to it, and throw Nest exceptions (`NotFoundException`, `ForbiddenException`, …) — never
  return a raw DB error.
- **DTOs are the input contract** — every request body is a class with `class-validator`
  decorators (`@IsString`, `@IsEnum(Diet)`, …). `ValidationPipe({ whitelist: true, transform:
  true })` strips undeclared properties. `update-*.dto.ts` uses `PartialType(CreateDto)`.
- **Entities are the output contract** — shape responses with class-transformer
  (`@Exclude()`/`@Expose()`) so `passwordHash` can never serialize out.

### Secure by default

- A global `JwtAuthGuard` protects **every** route; mark the few open routes with `@Public()`
  (register/login/refresh, health). Don't guard routes one by one.
- The `userId` comes from the verified JWT via the `@CurrentUser()` decorator — **never** from
  a client-supplied id, body, or param. Every per-user query is scoped to it.
- helmet (security headers) and `@nestjs/throttler` (rate limiting, especially on `/auth` and
  the paid `/recipes/generate`) are always on. `cookie-parser` enabled; CORS with
  `credentials: true`.

### Config & data access

- **Config is validated at boot** (`config/env.validation.ts`) — the app refuses to start on
  missing/invalid `DATABASE_URL`, JWT secrets, or `GEMINI_API_KEY`. In feature code read config
  through `ConfigService`, **never** `process.env`.
- Inject the single `PrismaService`; **never** `new PrismaClient()` elsewhere. Use
  `select`/`include` deliberately; **never select or return `passwordHash`**.

### Errors, logging, lifecycle

- Throw Nest exceptions in services. `PrismaExceptionFilter` maps DB errors (P2002→409,
  P2025→404, P2003→400); `AllExceptionsFilter` catches the rest. Both emit
  `{ success: false, message }` and never leak internals. The `ResponseInterceptor` wraps
  successes in `{ success: true, message, data }`.
- Structured logging via **nestjs-pino** + a `LoggingInterceptor` (method, url, status,
  latency) — never `console.log`. `app.enableShutdownHooks()` for a clean Prisma disconnect.
- AI runs server-side only (Gemini), isolated in the `ai/` module; wrap AI calls in try/catch
  with a friendly fallback — an AI outage must never break the rest of the API.

### Testing

- **Unit tests** (`*.service.spec.ts`) cover service logic with Prisma mocked.
- **e2e tests** (`test/*.e2e-spec.ts`) hit real HTTP against a test database.

---

## Reuse Before Creating

1. **Search first** — grep `src/shared/components/ui`, `src/shared/components`,
   `src/shared/lib`, and the feature's own `components/`/`api/` for something that already does
   the job. Never reimplement an existing helper or service.
2. **Extend, don't fork** — extend a close utility/component (extra prop, optional param,
   variant) rather than cloning it.
3. **Place by reach** — used by one feature → feature-local; used by two or more → promote to
   `src/shared`. Promote on the *second* use.

- **Components** are composable and **props-driven** — no business logic baked in. Build on
  `shared/components/ui` primitives; compose feature composites (`PantryRow`, `RecipeCard`,
  `MealSlot`) from them.
- After building or promoting a shared component, add a row to **ui-registry.md**.

---

## Constants vs. Config vs. Data

Three buckets hold values outside components:

- **Constants** — the authoritative *value* of something (route paths, slot names, enum
  labels). Pure data; no icons, classes, or JSX. Lives in `constants/`.
- **Config** — a structured object that drives how something *renders/behaves* (navigation
  links, diet/cuisine option lists with icons+labels, difficulty styles). Composes constants
  plus presentation. Lives in `config/`.
- **Data** — static **content** the UI renders that is *not* fetched from the API (e.g. the
  fixed list of supported cuisines/diets for the filter UI). Most app content comes from the
  **backend via services**, not from `data/` files. Lives in `data/`.

Config may import constants; constants must never import config. File naming: kebab-case —
constants `*.ts`, config `*.config.ts`, data `*.data.ts`.

---

## Naming

- **Folders:** kebab-case — `meal-planner`, `recipe-card`.
- **Component files:** PascalCase — `RecipeCard.tsx`, `PantryRow.tsx`. One component per file.
- **Hooks:** `useX.ts`. **Services:** `*.service.ts`. **Schemas:** `*.schema.ts`.
- **Constants/config/data:** kebab-case (`navigation.config.ts`, `cuisines.data.ts`).

---

## Component Structure

```typescript
"use client" // only if needed

// 1. External imports
import { useState } from "react"
import { Button } from "@components/ui/button"

// 2. Internal imports (shared, then feature)
import { cn } from "@lib/utils"
import { recipeService } from "@features/recipes/api/recipe.service"

// 3. Types
type Props = { id: string }

// 4. Component
export function RecipeView({ id }: Props) {
  // state · derived · handlers · JSX
}
```

- Prefer named exports (route entries `page.tsx`/`layout.tsx` are the only defaults).
- No inline styles; style with Tailwind classes using the design tokens.
- No hardcoded hex or raw Tailwind color literals — use tokens (ui-tokens.md).

---

## Error Handling

- Never use empty catch blocks.
- Console errors carry a context prefix: `[recipe.service]`, `[useMealPlan]`, `[AiService]`.
- User-facing errors are human-readable — surface form validation/submit errors inline; show
  a friendly fallback (toast/banner) when the API or AI is unavailable.

---

## Environment Variables

- **Frontend:** only `NEXT_PUBLIC_`-prefixed, non-secret values — chiefly
  `NEXT_PUBLIC_API_URL` (the backend origin + `/api`). **Never** put a secret in a
  `NEXT_PUBLIC_` variable.
- **Backend (`backend/.env`, never committed):** `DATABASE_URL`, `JWT_ACCESS_SECRET`,
  `JWT_REFRESH_SECRET`, `GEMINI_API_KEY`, `CORS_ORIGIN`. The `GEMINI_API_KEY` and DB
  credentials are backend-only and never reach the browser.
- Keep a `.env.example` in each app documenting the required keys (no real values).

---

## Import Aliases (frontend `tsconfig.json`)

```typescript
import { Button } from "@components/ui/button"        // ./src/shared/components/ui
import { cn } from "@lib/utils"                         // ./src/shared/lib
import axiosInstance from "@lib/axios.config"           // shared axios
import { recipeService } from "@features/recipes/api/recipe.service"
// Never: import { Button } from "../../../shared/components/ui/button"
```

Available: `@/*`, `@app/*`, `@features/*`, `@shared/*`, `@components/*`, `@lib/*`.

---

## Comments

- No comments restating what the code does — code should be self-explanatory.
- Comments only for **why** — a non-obvious decision or constraint.
- Never leave `TODO` comments in committed code.

---

## Dependencies

Don't install a package without a clear reason. First check: does shadcn/ui already provide
the component? does Next.js/React/Nest already provide it? The stack is documented in
architecture.md and each app's `package.json` — update the Stack table when adding a
dependency. On the backend, prefer the official `@google/genai` SDK for Gemini; do not add
another LLM provider.
</content>

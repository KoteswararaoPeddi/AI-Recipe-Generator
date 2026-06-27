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

## Backend (NestJS) — essentials

- One **module per domain** (`auth`, `pantry`, `recipes`, `meal-planner`, `shopping`,
  `users`). Controllers are thin; services hold logic. Full patterns in library-docs.md.
- Global `ValidationPipe` (`whitelist: true, transform: true`); every request body is a DTO
  with `class-validator` decorators. `cookie-parser` on; CORS with `credentials: true`.
- Inject the single `PrismaService`; **never** `new PrismaClient()` elsewhere. Use
  `select`/`include` deliberately; **never select or return `passwordHash`**.
- Every per-user query is scoped to the authenticated `userId`; never trust a client-supplied
  id. AI runs server-side only (Gemini); wrap AI calls in try/catch with a friendly fallback.

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

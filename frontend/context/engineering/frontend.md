# Frontend — Engineering Decisions (Next.js / React)

> Notable frontend decisions and techniques, written to **teach**. Most entries carry a `Learn` block:
> vocabulary (if needed) → ❌ naive vs ✅ our code → why → **where else you'd use it** → rule of thumb.
> See [README](./README.md) for the template.
>
> **Stack:** Next.js 16.2 (App Router) · React 19.2 · TypeScript 5 · Tailwind v4 · Zustand 5 ·
> react-hook-form 7 + Zod 4 · axios 1 · Base UI / Radix Slot / shadcn · sonner (toasts) · lucide icons.
> Source is feature-sliced: `src/features/<feature>/{api,components,schemas,lib,types}` + `src/shared`,
> wired via TS path aliases (`@features`/`@shared`/`@components`/`@lib`) in `frontend/tsconfig.json`.

## Rendering & Data-Fetching Strategy

### App layout — server layout wrapping a client shell (route groups)
- **What:** `(app)` route-group layout is a Server Component that renders the client `<AppShell>` chrome but passes `children` straight through, so pages stay Server Components while only the nav/header is a client boundary.
- **Where:** `frontend/src/app/(app)/layout.tsx`, mirrored in `frontend/src/app/(auth)/layout.tsx`; shell at `frontend/src/features/auth/components/AppShell.tsx`.
- **Why:** Keeps per-page `metadata` and the page tree server-rendered instead of forcing the whole authed subtree into one big `'use client'` boundary.

- **Learn**

  **First, the vocabulary** (these are the concepts this entry is really about):
  - **Server Component** — the *default* in Next's App Router. Runs **only on the server**, renders to
    HTML, ships **zero JavaScript** for itself. It can read `metadata`, hit a DB, keep secrets — but it
    **cannot** use `useState`, `useEffect`, `onClick`, or anything browser-only.
  - **Client Component** — a file that starts with `"use client"`. It ships JS to the browser and
    **can** use hooks, event handlers, and browser APIs. The cost: more JS + it renders on the client.
  - **The boundary rule (the important bit):** `"use client"` marks a *boundary*. Everything a client
    component **imports** joins the client bundle too. **But** anything passed as `children` is **not** —
    it's rendered by the *parent* and handed in as already-built content. So `children` lets a client
    component wrap server content without "infecting" it.
  - **Route group** — a folder in parentheses like `(app)` / `(auth)`. Groups routes to **share a
    layout**; the parenthesized name is **not** in the URL. `(app)/dashboard` → `/dashboard`.

  ````tsx
  // (app)/layout.tsx — a SERVER component (no "use client"). Wraps every page in the shell.
  export default function AppLayout({ children }: { children: React.ReactNode }) {
    return <AppShell>{children}</AppShell>          // AppShell is a client component…
  }

  // AppShell.tsx — a CLIENT component (needs hooks: usePathname, useEffect for the /auth/me check)
  "use client"
  export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()                 // ← browser-only hook, so this file MUST be client
    return <div><header>…</header><main>{children}</main></div>
    //                                        ↑ children came from the SERVER layout — still a
    //                                          Server Component, NOT swept into the client bundle
  }

  // (app)/dashboard/page.tsx — stays a SERVER component: can export `metadata`, ships no JS itself
  export const metadata = { title: "Dashboard | PantryChef" }
  export default function DashboardPage() { return <DashboardView /> }
  ````

  **Why this shape:** the nav/header genuinely needs client features (active-link highlighting via
  `usePathname`, the session check). The naive fix — `"use client"` on the layout — would drag **every
  page under it** into the client bundle, killing per-page `metadata` and server rendering. Instead only
  `AppShell` is client, and because pages arrive through `children`, they **stay Server Components**.

  **Where else you'd use this "client shell around server children" pattern:**
  - A **theme/context provider** (`<ThemeProvider>`, React Context) that must be client, wrapping
    otherwise-server pages via `{children}`.
  - A **dashboard/sidebar layout** with interactive collapse state around server-rendered panels.
  - A **modal or animation wrapper** (Framer Motion — needs client) around static server content.
  - The root **`<Providers>`** file — the classic Next pattern: one thin `"use client"` provider,
    everything else server.

  And the **route-group** idea (`(app)` vs `(auth)`) is reusable whenever two sections need *different*
  layouts — here `(auth)` is a bare centered card, `(app)` is full chrome — without either in the URL.

  **Rule of thumb:** push `"use client"` **as far down the tree as possible** — to the smallest
  interactive leaf. When a wrapper must be client, feed the rest through `children` so it stays on the
  server. "Client islands in a server sea," not the reverse.

### Thin server pages delegating to client "View" components
- **What:** Each page is a Server Component that only sets `metadata` + a heading, then hands off to a client `*View` that does the fetching (e.g. `DashboardView`).
- **Where:** `frontend/src/app/(app)/dashboard/page.tsx` → `DashboardView`; same pattern across all routes.
- **Why:** Server-side metadata per route without giving up client interactivity/data-fetching in the body.

- **Learn**

  ````tsx
  // ❌ make the whole page a client component → you LOSE `export const metadata` (client comps
  //    can't export it) and ship the static heading/SEO as JS too.
  "use client"
  export default function DashboardPage() { const [data] = useState(); return <>…</> }

  // ✅ our split — server "shell" owns metadata + static markup; client "View" owns the interactive data
  // page.tsx  (SERVER)
  export const metadata = { title: "Dashboard | PantryChef" }
  export default function DashboardPage() {
    return <div><h1>Dashboard</h1><DashboardView /></div>   // static heading stays server-rendered
  }
  // DashboardView.tsx  (CLIENT) — "use client", useEffect + useState, fetches and renders the data
  ````

  This is the same boundary rule as the entry above, applied *per page*: keep the page a Server
  Component so `metadata` and static content are free/SEO-friendly, and isolate the dynamic part in a
  named `View`. The `page` ↔ `View` naming makes the boundary obvious at a glance.

  **Where else you'd use it:** a blog post page (server: title, article HTML; client: comments widget);
  a product page (server: SEO + description; client: add-to-cart, image gallery); any screen that is
  mostly static but has one interactive region.

  **Rule of thumb:** default the page to a Server Component; carve the interactive part into a child
  client `View`. Don't reach for `"use client"` at the page level unless the *entire* page is interactive.

### Client-side data fetching via typed axios services (no Server Actions / RSC fetch)
- **What:** All data is fetched client-side through per-feature `api/*.service.ts` modules that unwrap a typed `ApiResponse<T>` envelope; called from `useEffect`. No Server Actions, no server `fetch`, no `revalidate`.
- **Where:** e.g. `frontend/src/features/recipes/api/recipes.service.ts`.
- **Why:** Simple, uniform contract against the NestJS API; trades RSC caching for a consistent cookie-authenticated axios client.

- **Learn**

  ````ts
  // ❌ call axios inline in every component and dig into the response shape each time
  const res = await axios.get("/recipes")
  const recipes = res.data.data      // what's the shape again? does it wrap in { data }? easy to get wrong

  // ✅ our "service layer" — one typed function per endpoint, unwraps the envelope once
  // recipes.service.ts
  export async function listRecipes(): Promise<Recipe[]> {
    const res = await api.get<ApiResponse<Recipe[]>>("/recipes")
    return res.data.data           // the { success, message, data } envelope is unwrapped HERE, once
  }
  // components just call: const recipes = await listRecipes()   // typed, no envelope knowledge needed
  ````

  A **service layer** is a thin module that owns "how we talk to the API" so components own "what to do
  with the data." Endpoint URLs, the response envelope, and types live in one place; if the API changes,
  you fix one file, not every component. It pairs with the backend's uniform envelope (see
  [backend.md](./backend.md)) — the service is the single spot that unwraps `.data.data`.

  **Where else you'd use it:** any app talking to an API — group calls by feature/resource
  (`auth.service`, `pantry.service`), keep components free of raw `axios`/`fetch`. It's also the seam
  where you'd later drop in React Query without touching components.

  **Rule of thumb:** never call `fetch`/`axios` directly in a component. Wrap each endpoint in a typed
  function in a `*.service.ts`; components import intent (`listRecipes()`), not transport.

### Next 16 async `params`
- **What:** Dynamic route awaits the `params` Promise before using `id`.
- **Where:** `frontend/src/app/(app)/recipes/[id]/page.tsx`.
- **Why:** Required by Next 16's async params API — not the sync `params` of older versions.

- **Learn**

  ````tsx
  // ❌ pre-Next-15 habit — params was a plain object
  export default function Page({ params }: { params: { id: string } }) {
    return <RecipeDetail id={params.id} />
  }

  // ✅ Next 16 — params is a Promise you must await (component becomes async)
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <RecipeDetail id={id} />
  }
  ````

  Newer Next versions made `params` (and `searchParams`) **async** so the framework can start rendering
  before route params are fully resolved. Practically: type it as a `Promise`, make the component
  `async`, and `await` it. This is the kind of thing that silently breaks when copy-pasting older
  tutorials — hence logging it.

  **Rule of thumb:** on this codebase's Next version, treat `params`/`searchParams` as Promises. If a
  snippet from the internet uses them synchronously, it's for an older Next — adapt it.

### Parallel dashboard load with `Promise.all`
- **What:** Dashboard fetches recipes + pantry + meal-plan concurrently instead of sequential awaits.
- **Where:** `frontend/src/features/dashboard/components/DashboardView.tsx:30`.
- **Why:** Three independent round-trips overlap → dashboard stats appear in ~1 round-trip instead of 3.
- **Learn**

  ````ts
  // ❌ slow — sequential awaits: each line waits for the previous to finish
  const recipes = await listRecipes()          // wait ~300ms
  const pantry  = await listPantry()            // THEN wait ~300ms
  const meals   = await listMealPlan(a, b)      // THEN wait ~300ms
  // total ≈ 900ms

  // ✅ what we did — fire all three at once, wait for the slowest
  Promise.all([listRecipes(), listPantry(), listMealPlan(a, b)])
    .then(([recipes, pantry, meals]) => { /* results in the SAME order passed in */ })
  // total ≈ 300ms
  ````

  Each `await` on its own line **pauses** until that request returns before the next starts — so three
  300ms calls run back-to-back (~900ms) even though none depends on another. `Promise.all` starts all
  three immediately; they travel the network in parallel and it resolves when the **slowest** finishes
  (~300ms). Results come back in the **order listed**, not the order they finished. It **fails fast**: if
  any rejects, the whole thing hits `.catch` (use `Promise.allSettled` for "keep whatever succeeded").

  **Where else you'd use it:** loading a page that needs several independent resources (user + settings +
  notifications); fanning out to multiple microservices; batch-processing a list of independent jobs;
  any "I need A, B, and C and none depends on the others."

  **Rule of thumb:** independent async calls → `Promise.all`. If B needs a value from A → `await` A first
  (genuinely sequential). Never serialize calls that could overlap.

### Root redirect instead of a public landing page
- **What:** `/` immediately `redirect("/login")`.
- **Where:** `frontend/src/app/page.tsx:5`.
- **Why:** App is auth-gated; no marketing landing surface. *(Pure fact — no lesson.)*

> _Not used (deliberately, so far): `loading.tsx`/`error.tsx`/`Suspense` streaming, SSG/ISR, Server
> Actions — loading & error states are hand-managed per view._

---

## Performance

> Pre-existing choices already in the codebase (recorded, not newly applied). Future perf changes are approval-gated per the README.

### Persistent AppShell chrome (no remount on navigation)
- **What:** The sticky header/nav renders once for the whole `(app)` segment; page content swaps beneath it.
- **Where:** `frontend/src/features/auth/components/AppShell.tsx` + the route-group layout.
- **Why:** Avoids re-mounting/re-rendering nav on every route change.

- **Learn**

  Because the nav lives in the **layout** (not in each page), Next keeps it mounted while only the
  `children` slot changes as you navigate. If instead every page imported and rendered `<Nav />` itself,
  the nav would unmount + remount on every navigation — losing any internal state (open menus, scroll)
  and re-running its effects (like the auth check) each time.

  **Where else you'd use it:** persistent sidebars, tab bars, audio/video players that keep playing
  across navigation, chat widgets — anything that should survive route changes goes in a **layout**, not
  a page.

  **Rule of thumb:** UI that must persist across routes belongs in a `layout.tsx`; UI specific to one
  screen belongs in its `page.tsx`. Layouts don't remount on navigation — pages do.

### `useMemo` for derived / filtered lists
- **What:** Memoizes filtered + faceted derivations of already-fetched arrays (filtered recipes & facets, pantry filter + expiring count, shopping category grouping, meal-planner week computation). This is the only memoization in the app — no `useCallback`/`React.memo`.
- **Where:** `RecipesView.tsx:46-55`, `PantryView.tsx:40-52`, `ShoppingView.tsx:46`, `MealPlannerView.tsx:29`.
- **Why:** Recomputing filters/groupings on every keystroke/render is wasteful; memo keyed on inputs avoids it.
- **Learn**

  ````ts
  // ❌ recomputed on EVERY render (typing in an unrelated input re-renders and re-groups the whole list)
  const grouped = groupByCategory(items)

  // ✅ recompute only when `items` changes
  const grouped = useMemo(() => {
    const categories = Array.from(new Set(items.map((i) => i.category))).sort()
    return categories.map((c) => ({ category: c, items: items.filter((i) => i.category === c) }))
  }, [items])   // dependency array: re-run ONLY if `items` differs from last render
  ````

  A React component re-runs its whole body on every render. Anything computed inline (sort/filter/group)
  is redone each time, even if inputs are identical. `useMemo` caches the result and recomputes only when
  a value in its dependency array changes; otherwise it returns the previous result.

  **Where else you'd use it:** an expensive calculation (parsing, formatting a big list, building a
  lookup Map); deriving chart data from raw rows; anything where the inputs change less often than the
  component renders. Its sibling `useCallback` does the same for *functions* you pass to memoized children.

  **Rule of thumb:** memoize when the work is **non-trivial** *and* its inputs change less often than
  renders. Skip it for cheap one-liners (`a + b`) — the bookkeeping costs more than it saves. Get the
  dependency array right: miss one → stale value; add too many → it never caches.

### Client-side in-memory filtering (no debounce, no virtualization)
- **What:** Search/category filters run in-memory over already-loaded arrays, with no debounce/throttle and no list virtualization.
- **Where:** `PantryView.tsx`, `RecipesView.tsx`, etc.
- **Why:** Deliberately trades scalability for simplicity given expected small per-user collections.
- **Learn**

  We filter the already-fetched array in memory, so there's no per-keystroke network call and no giant
  DOM — for a few dozen items that's the simplest thing that works. Two techniques we intentionally
  *didn't* add yet, and when you'd reach for them:
  - **Debounce** — wait until the user pauses typing before doing expensive work (a server search, a
    heavy filter). Prevents firing on every keystroke.
    ````ts
    // fire the search only after the user stops typing for 300ms
    useEffect(() => {
      const t = setTimeout(() => runSearch(query), 300)
      return () => clearTimeout(t)   // cancel the pending run if `query` changes again first
    }, [query])
    ````
  - **Virtualization** — render only the rows currently on screen (e.g. `@tanstack/react-virtual`)
    instead of all 10,000. Keeps the DOM small when lists get huge.

  **Where you'd need them:** debounce → search boxes that hit the server, autosave, resize/scroll
  handlers. Virtualization → long feeds, big tables, chat histories (hundreds+ of rows).

  **Rule of thumb:** in-memory filtering is fine for small lists. Add **debounce** when each change
  triggers expensive work (network/heavy compute); add **virtualization** when the list can grow into
  the hundreds/thousands. Don't add either preemptively — they're complexity you earn with scale.

### `next/image` configured but not yet used
- **What:** `next.config.ts` sets `remotePatterns`, `minimumCacheTTL: 86400`, custom `qualities` — but no `<Image>` is used yet; recipe cards render a gradient + `ChefHat` placeholder.
- **Where:** `frontend/next.config.ts:4-13`; placeholder in `RecipeCard.tsx:24-30`.
- **Why:** Forward-looking config for when recipe imagery lands. *(Recorded as configured-but-dead so it isn't mistaken for active optimization — no lesson.)*

---

## State & Data Management

### Zustand for two narrow concerns, not a global app store
- **What:** Zustand holds only (a) the auth session and (b) an imperative promise-based confirm dialog (`await confirm({...})`). Feature data is not globalized.
- **Where:** `frontend/src/shared/stores/auth.store.ts`, `frontend/src/shared/stores/confirm.store.ts:41-43`.
- **Why:** Confirm-store beats prop-drilling a dialog or ad-hoc `window.confirm`; auth-store gives a single hydration point. Everything else stays local.
- **Learn**

  **Vocabulary:** *global state* = data any component can read/write without passing props down
  (Zustand/Redux/Context). *Prop-drilling* = threading a value through many layers of props just to reach
  a deep child. *Local state* = `useState` inside the component that needs it.

  ````ts
  // The confirm store turns an imperative question into an awaitable Promise — no dialog prop-drilling.
  // confirm.store.ts (simplified)
  export const confirm = (opts) => new Promise<boolean>((resolve) => {
    useConfirmStore.setState({ open: true, opts, resolve })   // one <ConfirmDialog/> mounted globally reads this
  })
  // anywhere, in normal control flow:
  const ok = await confirm({ title: "Clear checked items?", confirmLabel: "Clear" })
  if (!ok) return
  ````

  The insight isn't "use Zustand for everything" — it's the opposite: **globalize only what's truly
  cross-cutting.** Auth status and a single shared confirm dialog are needed *everywhere*, so they earn a
  store. Recipe/pantry lists belong to one screen, so they stay in that screen's `useState`. A bloated
  global store (every list in Redux) is a common beginner trap — it couples unrelated screens and makes
  state hard to reason about.

  **Where else you'd use a tiny global store:** current user/session, theme, a toast/confirm host,
  feature flags, a cart badge count — small, app-wide, read by many. **Keep local:** form inputs, a
  screen's fetched list, "is this dropdown open."

  **Rule of thumb:** default to local `useState`. Promote to a global store only when *many unrelated
  components* need the same value. The confirm-as-Promise trick is great whenever you want imperative
  `await`-style UX (confirm/prompt) without threading callbacks.

### Auth store is UX-only; backend is source of truth
- **What:** Store is hydrated once from `GET /auth/me` on mount; redirects to `/login` on failure. Doc explicitly notes it's UX-only.
- **Where:** `AppShell.tsx:27-35`; note in `auth.store.ts:14-18`.
- **Why:** Client state must never be treated as an authorization decision — the server re-checks every request.
- **Learn**

  ````ts
  // The client store answers "what should the UI show?" — NOT "is this user allowed?"
  if (status !== "authenticated") return <Loading />   // UX only: hide chrome until we know
  // …but EVERY protected API call is still re-verified by the server (JWT cookie → guard).
  ````

  A very common security misunderstanding: "I hid the admin button in React, so it's protected." It
  isn't — anyone can edit client state or call the API directly. Client auth state exists purely to make
  the UI pleasant (show a spinner, hide nav, redirect). **Real** authorization happens on the server on
  every request (see the global JWT guard in [auth-security.md](./auth-security.md)). Here the store is a
  cache of "the server said we're logged in," never the decision itself.

  **Where else this applies:** role-based UI (hide vs. enforce), feature gating, "owner can edit" badges
  — always render optimistically on the client *and* enforce on the server. The client copy is a
  convenience, the server is the truth.

  **Rule of thumb:** the client decides what to *show*; the server decides what's *allowed*. Never trust
  a client-side flag for anything security-relevant.

### Hand-rolled `useEffect` fetches with an `active` cleanup guard (no React Query/SWR)
- **What:** Each view uses `useEffect` + `let active = true` cleanup to prevent setState-after-unmount; meal-planner splits a fetch-once recipe pool from a per-week refetch keyed on `[week]`.
- **Where:** `ShoppingView.tsx:31-40`, `PantryView.tsx:29-38`, `MealPlannerView.tsx:34-60`.
- **Why:** Avoids adding a data-fetching library for a small app; the `active` guard is the manual equivalent of query cancellation.
- **Learn**

  ````ts
  // ❌ if the user navigates away before the fetch resolves, setItems runs on an unmounted component
  useEffect(() => { listShopping().then((data) => setItems(data)) }, [])

  // ✅ a flag flipped by the cleanup function guards every setState
  useEffect(() => {
    let active = true
    listShopping()
      .then((data) => active && setItems(data))     // skip if we've unmounted
      .catch((e) => active && toast.error(getErrorMessage(e)))
      .finally(() => active && setLoading(false))
    return () => { active = false }                 // cleanup runs on unmount / before the effect re-runs
  }, [])
  ````

  A `useEffect` can start an async request, but the component might unmount (or the effect re-run with
  new deps) *before* it finishes. The `return () => { active = false }` cleanup runs at exactly that
  moment; since `.then/.catch/.finally` all check `active`, a late response is ignored instead of setting
  state on something that's gone. It's the manual version of what React Query/SWR give you (cancellation
  + de-dup + caching).

  **Where else you'd use it:** any effect that sets state from an async result — search-as-you-type,
  loading a detail view by id, subscriptions. The `AbortController` variant additionally *cancels* the
  in-flight request, not just ignores it.

  **Rule of thumb:** every async-effect-that-sets-state needs a cleanup guard (`active` flag or
  `AbortController`). If you're writing this in many components, that's the signal to adopt a
  data-fetching library.

### axios refresh-token interceptor with a concurrency queue
- **What:** On 401, runs a single `/auth/refresh` (httpOnly cookie rotation), queues other in-flight 401s in `failedQueue` and replays them after refresh, hard-redirects to `/login` if refresh fails. `withCredentials: true`, no bearer tokens in JS.
- **Where:** `frontend/src/shared/lib/axios.config.ts:47-69`.
- **Why:** Prevents a "thundering herd" of parallel refresh calls when several requests 401 at once; cookie-based storage keeps tokens out of JS-reachable memory.
- **Learn**

  **Vocabulary:** an **axios interceptor** is a hook that runs on every request/response — perfect for
  cross-cutting logic like "on any 401, try to refresh and retry."

  ````ts
  // ❌ naive: every request that 401s fires its own /auth/refresh → concurrent refreshes race/rotate
  if (status === 401) { await refreshAccessToken(); return axiosInstance(originalRequest) }

  // ✅ one refresh at a time; others wait in a queue, then replay
  let isRefreshing = false
  let failedQueue = []                              // requests parked while a refresh is in flight
  if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
    if (isRefreshing)                               // a refresh is already running…
      return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
        .then(() => axiosInstance(originalRequest)) // …park this request, replay when refresh done
    originalRequest._retry = true                   // mark so we never loop-refresh the same request
    isRefreshing = true
    try { await refreshAccessToken(); processQueue(null); return axiosInstance(originalRequest) }
    catch (err) { processQueue(err); window.location.href = "/login" }
    finally { isRefreshing = false }
  }
  ````

  When a token expires, several in-flight requests can all 401 at once. Uncoordinated, each calls
  `/auth/refresh` — a race, and with token rotation they invalidate each other. The `isRefreshing` flag
  ensures only the *first* 401 refreshes; the rest push `{resolve, reject}` into `failedQueue` and pause.
  When the single refresh succeeds, `processQueue` releases them and each retries. `_retry` prevents an
  infinite refresh→401→refresh loop.

  **Where else you'd use this "do X once, make concurrent callers wait" shape:** a token/cred fetch, a
  one-time WebSocket connect, lazy-initializing an expensive singleton, cache-stampede prevention —
  anywhere many callers would otherwise trigger the same expensive work simultaneously.

  **Rule of thumb:** "run this shared work once, queue everyone else until it's done" = an in-flight
  boolean flag + a queue of waiters released on completion.

### react-hook-form + Zod with `mode: "onBlur"`
- **What:** Forms use `zodResolver` against per-feature schemas, validating on blur.
- **Where:** `LoginForm.tsx:26-30`; schemas in each feature's `schemas/*.schema.ts`.
- **Why:** Shared Zod schemas double as types; onBlur avoids noisy per-keystroke errors.
- **Learn**

  ````ts
  // Zod schema = validation rules AND the TypeScript type, from one source
  const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) })
  type LoginValues = z.infer<typeof loginSchema>          // ← type derived from the schema, never drifts

  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: "onBlur" })
  // react-hook-form tracks inputs without re-rendering on every keystroke; Zod validates; errors show on blur
  ````

  Two ideas worth internalizing: (1) **schema-as-source-of-truth** — define the shape once in Zod and
  *derive* the TS type with `z.infer`, so validation and types can never disagree. (2) **react-hook-form**
  keeps inputs "uncontrolled" for performance (no re-render per keystroke) and centralizes errors. `mode:
  "onBlur"` validates when a field loses focus — friendlier than screaming on the first character.

  **Where else you'd use it:** any form (signup, settings, checkout); the same Zod schema can validate on
  the client *and* be reused/served to the backend; Zod is also great for parsing API responses and env
  vars.

  **Rule of thumb:** one Zod schema per form → `zodResolver` + `z.infer` for the type. Validate on blur
  (or submit) for calm UX; save on-change validation for fields that need instant feedback.

---

## UX & Accessibility

### Content-shaped skeletons (not spinners)
- **What:** Loading states render skeletons that mirror the final layout, with comments tying each skeleton to the real element.
- **Where:** `DashboardView.tsx:51-118`, `ShoppingView.tsx:143-158`, `RecipeDetail.tsx:46-94`.
- **Why:** Reduces layout shift and reads as "content loading" rather than a blank spinner.
- **Learn**

  ````tsx
  // ❌ a centered spinner — the page is blank, then everything pops in and SHIFTS the layout
  {loading ? <Spinner /> : <CardGrid items={items} />}

  // ✅ a skeleton shaped like the real content — same size/positions, so nothing jumps when data lands
  {loading
    ? Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}><Skeleton className="size-12 rounded-xl" /><Skeleton className="h-4 w-24" /></Card>
      ))
    : <CardGrid items={items} />}
  ````

  A skeleton is a gray placeholder in the **shape** of the content that's coming. Because it occupies the
  same space, the real content replaces it without the page jumping (good **CLS** — Cumulative Layout
  Shift, a Core Web Vital). It also *feels* faster than a spinner because the user sees the structure
  immediately.

  **Where else you'd use it:** feeds, tables, profile headers, dashboards — anywhere the layout is known
  before the data arrives. (A spinner is still fine for truly unknown-shape or very short waits.)

  **Rule of thumb:** if you know the shape of what's loading, show a skeleton of that shape, not a
  spinner. Match its dimensions to the real element to avoid layout shift.

### Distinct not-found vs error vs network-down states
- **What:** Recipe detail distinguishes a 404 ("doesn't exist") from a generic error, and a missing `error.response` (network down) gets its own message.
- **Where:** `RecipeDetail.tsx:34-39`; `frontend/src/shared/lib/get-error-message.ts:12-19`.
- **Why:** Three different failures need three different user messages, not one catch-all.
- **Learn**

  ````ts
  // ❌ one message for everything — user can't tell "wrong link" from "server down" from "try again"
  catch { toast.error("Something went wrong") }

  // ✅ branch on the failure so the message is actionable
  if (isAxiosError(error) && error.response?.status === 404)  showNotFound()          // bad/old link
  else if (isAxiosError(error) && !error.response)            showOffline()           // no network
  else                                                        showRetry(getErrorMessage(error)) // server/other
  ````

  Different failures call for different user responses: a **404** means "this thing doesn't exist" (offer
  a way back, not a retry); **no `error.response`** means the request never reached the server (offline /
  CORS / server down — "check your connection"); anything else is a genuine server error ("try again").
  Collapsing all three into "something went wrong" leaves users stuck.

  **Where else you'd use it:** any data-loading screen — detail pages, dashboards, search. Centralizing
  the mapping in `get-error-message.ts` means every screen speaks the same language.

  **Rule of thumb:** classify errors into *not-found / offline / server / validation* and give each an
  actionable message. One catch-all string is a UX (and debugging) dead end.

### Toasts mounted once and reused by id
- **What:** One Sonner `<Toaster>` is mounted globally; flows call `toast.loading(...)` then resolve the same id to success/error.
- **Where:** `frontend/src/shared/components/GlobalHosts.tsx`; usage e.g. `GeneratorView.tsx:78-87`.
- **Why:** Single mount point; a loading toast morphs into its result instead of stacking.
- **Learn**

  ````ts
  const id = toast.loading("Generating recipe…")     // returns an id
  try { await generate(); toast.success("Done!", { id }) }   // SAME id → the toast morphs in place
  catch (e) { toast.error(getErrorMessage(e), { id }) }      // not a second, stacked toast
  ````

  Mount the toast **host** once (globally); everywhere else just calls `toast.*`. Passing the same `id`
  updates the existing toast rather than stacking a new one — so "loading → success" is one moving toast,
  not two. This mirrors the "mount the host once, trigger from anywhere" pattern (same idea as the global
  confirm dialog).

  **Where else you'd use it:** progress for uploads, saves, any async action with a loading→result arc;
  global modals/drawers/tooltips all follow "one host, many triggers."

  **Rule of thumb:** mount UI hosts (toasts, modals, confirm) once at the root; drive them imperatively.
  Reuse the toast `id` to turn a loading state into its outcome in place.

### Accessibility & responsive touches
- **What:** `aria-label` on icon-only buttons; `aria-invalid` bound to field errors + `noValidate` on forms; Enter-to-add in the ingredient input; center nav hidden below `lg`; meal-planner grid collapses `grid-cols-1 → sm:2 → lg:7`.
- **Where:** `RecipeCard.tsx:69`, `LoginForm.tsx:45-63`, `GeneratorForm.tsx:81-86`, `AppShell.tsx:56`, `MealPlannerView.tsx:140`.
- **Why:** Baseline a11y for icon buttons/forms and a usable mobile→desktop layout.
- **Learn**

  ````tsx
  <button aria-label="Delete recipe"><Trash2 /></button>   // icon-only → screen reader has NO text without this
  <input aria-invalid={!!errors.email} />                  // announces the field as invalid to assistive tech
  <form noValidate>…</form>                                // we own validation (Zod), so silence the browser's
  <nav className="hidden lg:flex">…</nav>                  // Tailwind: hidden by default, flex at ≥ lg
  ````

  Two habits worth building: (1) **an icon is invisible to a screen reader** — a button whose only child
  is an SVG needs an `aria-label` or it's announced as just "button." (2) **Tailwind is
  mobile-first**: unprefixed classes apply at all sizes, and `sm:`/`lg:` *add* rules at that breakpoint and
  up (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-7` = 1 column on phones, 2 on tablets, 7 on desktop).

  **Where else you'd use it:** every icon button/link needs a label; every input that can be invalid
  should reflect it; design layouts phone-first, then layer breakpoints upward.

  **Rule of thumb:** if a control has no visible text, give it an `aria-label`. Style the small screen
  first, then add `sm:`/`md:`/`lg:` overrides — don't design desktop-first and fight it back down.

### Client-side serving scaler
- **What:** Recipe detail computes a scale `factor` and applies it via `scaleAmount`, which regex-parses a numeric prefix and leaves non-numeric strings ("to taste") unchanged.
- **Where:** `RecipeDetailView.tsx:35-38`, `frontend/src/features/recipes/lib/scale-amount.ts`.
- **Why:** Rescales quantities in the browser without a round-trip, while safely ignoring unparseable amounts.
- **Learn**

  ````ts
  // Pure function: (amount string, factor) → scaled string. No state, no I/O → trivial to test.
  scaleAmount("2 cups", 2)      // "4 cups"     — parse leading number, multiply, keep the unit
  scaleAmount("to taste", 2)    // "to taste"   — no leading number → return unchanged (don't break it)
  scaleAmount("1/2 tsp", 3)     // handles the numeric prefix; leaves the rest alone
  ````

  Two lessons: (1) **do it on the client** — scaling servings is pure arithmetic on data you already
  have, so a server round-trip would be pointless latency. (2) **write it as a pure function** in
  `lib/` — given the same inputs it always returns the same output, touches nothing external, so it's
  easy to reason about and unit-test in isolation. The regex "parse the number if there is one, otherwise
  pass the string through untouched" is a robust way to handle messy real-world data ("to taste", "a
  pinch").

  **Where else you'd use it:** currency/unit conversion, formatting, any transform of already-loaded
  data; and defensively parsing free-text/user data where some values won't match the expected shape.

  **Rule of thumb:** transform data you already have on the client (no needless round-trips), and put
  pure transforms in `lib/` as pure functions. When parsing messy input, degrade gracefully — transform
  what matches, pass through what doesn't.

### Generator pre-flight validation
- **What:** Blocks the AI generate call if the pantry is empty, before hitting the endpoint.
- **Where:** `GeneratorView.tsx:31-50`.
- **Why:** Avoids a guaranteed-useless AI call (and its cost/quota) when there are no ingredients.
- **Learn**

  ````ts
  if (pantry.length === 0) {                          // fail fast, locally, for free
    toast.error("Add some ingredients to your pantry first")
    return                                            // never spends an AI call we know will be useless
  }
  await generateRecipe(...)                           // only reached when the request can actually succeed
  ````

  A **pre-flight check** is a cheap local guard before an expensive/irreversible operation. Generating a
  recipe from *no* ingredients can't produce anything good, and each call costs quota/money — so we catch
  it in the browser instantly instead of paying a round-trip to learn the obvious.

  **Where else you'd use it:** disable/guard a submit until a form is valid; check "is there a file
  selected" before uploading; confirm before a destructive action; verify preconditions before any paid
  API call.

  **Rule of thumb:** validate cheaply and locally before doing expensive work. The best failed API call
  is the one you never made.

---

## Tooling & Dev Workflow

### Never run `next build` while `next dev` is live (`.next` cache corruption)

- **What:** A "login page is 404" report traced to a corrupted Turbopack `.next` cache — the give-away
  was a typecheck error `Expression expected` in `.next/dev/types/routes.d.ts`, a **generated** file
  nobody wrote. Recovered with: stop all dev servers → `rm -rf .next` → start **one** fresh `npm run dev`.
- **Where:** build/dev workflow (no source change); symptom surfaced in generated `.next/dev/types/`.
- **Why:** it was caused by running `npm run build` while `npm run dev` was still running. Both commands
  write the same `.next` directory; run concurrently they interleave writes and leave the generated route
  types half-written → routes 404 and typecheck fails on a file you can't fix by editing code.
- **Learn**

  **Vocabulary:** `.next` is Next's build-output/cache dir — compiled routes, **generated** types
  (`routes.d.ts`), and the Turbopack cache. It's *derived state*: never edited by hand, always safe to
  delete and regenerate.

  ```text
  # ❌ "let me just build to check" while the dev server is up
  # (next dev already running)
  npm run build      # two processes writing .next → corrupt generated types → 404s

  # ✅ pick ONE. To check types without disturbing the running dev cache:
  npx tsc --noEmit

  # ✅ recover a corrupted cache:
  #   stop all dev servers  →  rm -rf .next  →  start ONE `npm run dev`
  ```

  Plain-english **why:** the two commands share one mutable output dir with no locking, so concurrent
  writers can leave it half-written. Deleting `.next` throws away the corrupted derived state; it
  regenerates cleanly on the next run — so there's nothing to "fix" in the source.

  **Where else you'd use this:** any shared build cache written by two processes at once (Vite
  `dist`/`.vite`, webpack cache, `tsc --build` `.tsbuildinfo`, a Turborepo/Nx cache); "impossible" errors
  pointing at a **generated/vendored** file (delete + regenerate *before* debugging code); flaky CI from a
  stale build dir (clean before build).

  **Rule of thumb:** don't point two build/dev processes at one output dir. When an error blames a file
  you never wrote, suspect a stale cache — delete it and regenerate before touching source.

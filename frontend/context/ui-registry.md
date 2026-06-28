# UI Registry

Living document. Updated after every shared component is built. **Read this before building
any new component** — match an existing pattern before inventing a new one.

## How to Use

Before building a component:

1. Check if a similar component already exists here (or in `src/shared/components/ui`).
2. If yes — reuse it; match its props/classes.
3. If no — build it on shadcn/ui primitives following ui-rules.md + ui-tokens.md, then add a
   row below.

After building or promoting a shared component, add it here with its file path and a short
note. Feature composites are logged here as they are built.

---

## UI Typos / Known Issues

Record UI copy typos and other UI issues here: location (page/component + file), current
(wrong) text, correct text, status.

| # | Location (component / file) | Current text | Correct text | Status |
| - | --------------------------- | ------------ | ------------ | ------ |
| 1 | scaffold chrome (`Logo`/`Navbar`/`Footer`, `(customer)` group) | portfolio template copy + naming | replace with PantryChef `(auth)`/`(app)` chrome | Open (Phase 0 cleanup) |

---

## Components

The app is at the **scaffold** stage: only shadcn primitives and placeholder portfolio chrome
exist. Feature composites (auth forms, `PantryRow`, `RecipeCard`, `RecipeView`, `MealSlot`,
`ShoppingItemRow`) are logged here as they land.

### Primitives (`src/shared/components/ui`)

Token-styled shadcn/ui primitives currently vendored. Add more (`select`, `table`, `tabs`,
`dialog`, `calendar`, `checkbox`, …) via the shadcn CLI when a feature needs them.

| Component | File | Notes |
| --------- | ---- | ----- |
| Button | `ui/button.tsx` | base-ui Button + cva. Variants: default/outline/secondary/ghost/destructive/link; sizes xs–lg + icon. Token-styled (`bg-primary text-primary-foreground`, focus `ring-ring`). |
| Card | `ui/card.tsx` | `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`. Base is surface only (`rounded-xl border bg-card`) so variants compose. `bg-card` resolves to `--surface`. |
| Badge | `ui/badge.tsx` | cva chip, `border-border`. Use for expiry/low-stock status, diet/cuisine/difficulty tags. Style status variants with `warning`/`danger`/`success` tokens. |
| Separator | `ui/separator.tsx` | Token `bg-border` rule (`role="separator"`); `h-px w-full` / `w-px h-full`. |
| Input | `ui/input.tsx` | Token-styled text input (`border-input`, ring on focus). RHF `register()` ref flows through via React 19 ref-as-prop. |
| Textarea | `ui/textarea.tsx` | forwardRef `<textarea>`; mirrors `Input`, `min-h-24`, `aria-invalid:border-destructive`. |
| Label | `ui/label.tsx` | `<label>`, `text-body-sm font-medium text-foreground select-none`. Used by `Field`. |
| Field | `ui/field.tsx` | Wrapper: `Label` + control + `error` (`text-body-sm text-danger`); `flex flex-col gap-1.5`; optional muted `hint`. Use for every form field. |
| Typography | `ui/typography/` | Polymorphic text component (`typography.tsx` + styles/types/constants). **Not shadcn** — custom. **All content text goes through it** (variant + weight props); colour/layout via `className`. |
| Dialog | `ui/dialog.tsx` | **shadcn** (base-ui). `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle`/`DialogFooter`/`DialogClose`. Controlled via `open`/`onOpenChange`; `DialogContent` has a built-in close button. |
| Select | `ui/select.tsx` | **shadcn** (base-ui). `Select`/`SelectTrigger`/`SelectValue`/`SelectContent`/`SelectItem`. Controlled via `value`/`onValueChange`. With RHF use a `Controller`. |
| Checkbox | `ui/checkbox.tsx` | **shadcn** (base-ui). `checked`/`onCheckedChange`. `data-checked:bg-primary`. With RHF use a `Controller`. |
| Slider | `ui/slider.tsx` | **shadcn** (base-ui). Pass `value` as a **single-element array** for one thumb (`value={[n]}`, `onValueChange` returns an array). `min`/`max`/`step`. |
| Toaster | `ui/sonner.tsx` | sonner `<Toaster>` wrapper, `theme="dark"` `position="top-center"` `richColors` `closeButton`. Mounted once in the root `layout.tsx`. Call `toast.loading/success/error` anywhere for async feedback. |

### Shared composites (`src/shared/components`)

| Component | File | Notes |
| --------- | ---- | ----- |
| Logo · Navbar · Footer | `Logo.tsx` · `Navbar.tsx` · `Footer.tsx` | **Placeholder portfolio chrome** from the scaffold. To be replaced with PantryChef chrome: `(auth)` layout card + `(app)` sidebar/top-nav (Pantry, Generate, Recipes, Meal Planner, Shopping List, Preferences). Don't build on the portfolio framing. |

### Features (`src/features/*`)

| Component | File | Notes |
| --------- | ---- | ----- |
| LoginForm · SignupForm | `features/auth/components/{LoginForm,SignupForm}.tsx` | The auth form pattern (see entry below). `"use client"`, RHF + Zod (`auth.schema.ts`), submit via `auth.service`, redirect `/` on success. |

All `(app)` pages are now built (dashboard, pantry, generate, recipes, meal-plan, shopping,
settings). Remaining work is wiring them to the real backend APIs as the phases land.

---

## Auth pattern — captured via /imprint

The reusable shapes from the first real feature. **Every future form, form-card, and full-page
centered shell should match these.**

### Auth form (`LoginForm`, `SignupForm`)

File: `src/features/auth/components/{LoginForm,SignupForm}.tsx`
Last updated: 2026-06-28

| Property | Class |
| -------- | ----- |
| Form container | `flex flex-col gap-4` |
| Field stack | `Field` primitive (label + control + error), `gap-4` between fields |
| Input | `Input` primitive (`border-input bg-surface rounded-lg`, focus `ring-ring`) |
| Field error text | `text-body-sm text-danger` (via `Field` `error` prop) |
| Submit feedback | **toast** (sonner) — `toast.loading(...)` → `toast.success`/`toast.error` with the same `id` |
| Submit button | `Button` (default variant) `mt-2 w-full`; `disabled` while submitting |
| Submitting label | swap text to `"...ing"` form (`Signing in...`, `Creating account...`) |

**Pattern notes:** every form uses **RHF + Zod** with `mode: "onBlur"`; the Zod schema in
`schemas/*.schema.ts` is the single source of truth. **Inline field errors** come from the
`Field` primitive (validation). **Submit/API feedback goes to a toast**, not an inline banner:
`const id = toast.loading("...")` then `toast.success("...", { id })` or
`toast.error(getErrorMessage(error), { id })` — the loading spinner is the progress indicator and
the same `id` makes it transition in place. `noValidate` on the `<form>` (RHF/Zod owns
validation); inputs set `aria-invalid` from the field error. Three states: field errors, submitting
(disabled + label change), and the success/error toast.

### Auth card page (`login`, `signup` pages)

File: `src/app/(auth)/{login,signup}/page.tsx`
Last updated: 2026-06-28

| Property | Class |
| -------- | ----- |
| Card | `Card` primitive `w-full max-w-sm shadow-md` (`bg-card border rounded-xl`) |
| Header | `CardHeader` `text-center` |
| Title | `CardTitle` `text-h3 text-foreground` |
| Description | `CardDescription` (muted: `text-body-sm text-muted-foreground`) |
| Content | `CardContent` `flex flex-col gap-6` |
| Footer link row | `text-center text-body-sm text-muted-foreground`; link `text-primary hover:underline` |

**Pattern notes:** pages are thin **Server Components** that render the client form; each sets
its own `metadata.title`. A form-card is `max-w-sm` with `shadow-md`. The cross-link to the
other auth page sits below the form in muted text with a `text-primary` link.

### Centered page shell (`(auth)` layout)

File: `src/app/(auth)/layout.tsx`
Last updated: 2026-06-28

| Property | Class |
| -------- | ----- |
| Shell | `main` `flex min-h-screen items-center justify-center bg-background px-4 py-10` |

**Pattern notes:** full-height centered container on `bg-background`, no app chrome. Reuse this
shape for any standalone centered page (auth, 404, simple confirmations).

### Landing hero (`/`)

File: `src/app/page.tsx`
Last updated: 2026-06-28

| Property | Class |
| -------- | ----- |
| Shell | `main` `flex min-h-screen flex-col items-center justify-center gap-10 bg-background px-4 py-16 text-center` |
| Eyebrow | `text-label-lg font-semibold tracking-wide text-primary uppercase` |
| Headline | `text-display-lg font-extrabold text-foreground` |
| Subcopy | `text-body-lg text-muted-foreground` (`max-w-md`, centered) |
| CTA (link-as-button) | `cn(buttonVariants({ size: "lg" }), "px-6")` — primary; `variant: "outline"` for secondary |

**Pattern notes:** a **link styled as a button** uses `cn(buttonVariants({ ... }), "...")` (Next
`<Link>` + the exported `buttonVariants`), never a `Button` wrapping a `Link`. Server Component.

### App shell — top navbar (`(app)` group)

Files: `features/auth/components/AppShell.tsx` · `UserMenu.tsx` · `shared/config/app-nav.ts`
Last updated: 2026-06-28

| Property | Class |
| -------- | ----- |
| Shell root | `min-h-screen bg-background` |
| Header bar | `sticky top-0 z-30 border-b border-border bg-surface`; inner `mx-auto flex h-16 max-w-7xl items-center gap-6 px-6` |
| Brand | logo well `flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary` + `text-h6 font-bold text-foreground` |
| Nav link | `flex items-center gap-2 rounded-lg px-3 py-2 text-body-base font-medium` |
| Nav link (active) | `bg-primary/10 text-primary` |
| Nav link (idle) | `text-muted-foreground hover:bg-muted hover:text-foreground` |
| User avatar | `flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-label-base font-semibold` |
| Dropdown panel | `rounded-lg border border-border bg-popover p-1 shadow-md` |
| Content container | `main` `mx-auto w-full max-w-7xl px-6 py-8` |

**Pattern notes:** the `(app)` **layout (Server) wraps the client `AppShell`**, passing `{children}`
through so pages **stay Server Components** (children-slot). Active nav state from `usePathname`.
Nav items in `shared/config/app-nav.ts` (`{label, href, icon}`). `UserMenu` is a lightweight
`useState` dropdown (no shadcn dropdown dep). Auth via `useAuthStore`; hydration two paths
(login/signup seed `setUser`; `AppShell` `getMe` only when `status === "loading"`).

### Dashboard cards (`features/dashboard`)

Files: `features/dashboard/components/{StatCard,ActionCard,RecentRecipes,UpcomingMeals}.tsx`
Last updated: 2026-06-28

| Property | Class |
| -------- | ----- |
| Card base | `Card` primitive `p-6 shadow-sm` |
| Stat icon well | `flex size-12 items-center justify-center rounded-xl` + tone: `bg-primary/10 text-primary` · `bg-info/10 text-info` · `bg-purple-500/10 text-purple-500` |
| Stat label / value | `text-body-base text-muted-foreground` / `text-h1 font-bold text-foreground` |
| Action card (highlighted) | `border-primary/30 bg-primary-subtle` |
| List header | `flex items-center justify-between`; title `text-h4 font-semibold`; link `text-body-base font-medium text-primary hover:underline` |
| List row | `flex items-center gap-3 rounded-lg p-2 hover:bg-muted`; row icon well `size-10 rounded-lg` |
| Stat/section grids | stats `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`; actions/lists `md:grid-cols-2` / `lg:grid-cols-2` |

**Pattern notes:** multi-color icon wells (green/blue/purple) are the dashboard accent — green =
`primary`, blue = `info`, purple = the `purple-500` foundation scale (sanctioned decorative
one-off). Cards are presentational **Server Components**; content is **mock data** in
`features/dashboard/data/` until the real APIs land. `ComingSoon` is the stub for unbuilt nav routes.

### Pantry (`features/pantry`)

Files: `PantryView` (client orchestrator) · `PantryItemCard` · `ExpiringAlert` · `PantryFilters` · `AddItemDialog`
Last updated: 2026-06-28

| Property | Class / note |
| -------- | ------------ |
| Page header | title `Typography variant="display-lg" weight="bold"` + subtitle `body-lg text-muted-foreground`; `Button` "Add Item" (lucide `Plus`) on the right |
| Expiring alert | `rounded-xl border border-warning/30 bg-warning/10 p-4` + `AlertCircle text-warning` |
| Filter bar | `rounded-xl border border-border bg-surface p-4`; search `Input` w/ leading icon (`pl-9`); category pills `bg-primary text-primary-foreground` (active) / `bg-muted text-muted-foreground` (idle) |
| Item card | `Card p-5 shadow-sm`; ✕ delete `hover:text-destructive`; expired → `text-destructive`; "Running Low" `bg-warning/15 text-warning` chip |
| Add dialog | shadcn **`Dialog`** + **`Select`** (unit/category, via RHF `Controller`) + **`Checkbox`**; RHF + Zod (`pantry.schema.ts`), quantity uses `register(..., { valueAsNumber: true })` |

**Pattern notes:** the page is a thin Server Component rendering the client `PantryView` (holds
items + search + category + dialog state). **Mock data** (`data/pantry.data.ts`) with client-side
add/delete/filter until the `/pantry` API exists. Expiry status (`lib/expiry.ts`) compares to
`new Date()`. All text via `Typography`; modal/select/checkbox are **installed shadcn**, not hand-rolled.

### Recipes — list + detail (`features/recipes`)

Files: `RecipesView` (client list orchestrator) · `RecipeCard` · `RecipeTags` · `RecipeDetailView` (client) · `lib/scale-amount.ts`
Last updated: 2026-06-28

| Property | Class / note |
| -------- | ------------ |
| Recipe tags (shared `RecipeTags`) | `Typography` chip `rounded-full px-2.5 py-0.5` — **cuisine** `bg-primary/10 text-primary`; **difficulty by level** Easy `bg-success/10 text-success` · Medium `bg-warning/10 text-warning` · Hard `bg-danger/10 text-danger`; **diet** `bg-purple-500/10 text-purple-500`. Diet falls back to `[recipe.diet]` when `dietTags` absent. |
| List filter bar | `rounded-xl border border-border bg-surface p-4 shadow-sm`; search `Input` w/ leading icon (`pl-9`) + two shadcn `Select` (`lg:w-44`) — All Cuisines / All Difficulties, options derived from the data |
| Result count | `Typography body-sm text-muted-foreground` — "Showing X of Y recipes" |
| Recipe card | `Card flex flex-col overflow-hidden shadow-sm hover:shadow-md`; **media well** `h-44 bg-gradient-to-br from-primary/20 to-primary/5` + `ChefHat size-16 text-primary`; body `p-5 gap-3`; title `h5` `text-primary hover:underline` (link); desc `body-sm line-clamp-2`; meta row clock-mins / `Flame` cal; `Separator`; actions: **View Recipe** `Link` + `buttonVariants()` `flex-1` + outline icon `Trash2` (`hover:text-destructive`) |
| Card grid | `grid gap-6 md:grid-cols-2 lg:grid-cols-3` |
| Empty state | `rounded-xl border border-dashed border-border bg-surface p-12 text-center` |
| Detail back-link | `inline-flex items-center gap-2 text-body-base font-medium text-muted-foreground hover:text-foreground` + `ArrowLeft` |
| Detail header card | `Card p-8 shadow-sm`; `h1` title + ghost icon `Trash2` (delete → toast + `router.push("/recipes")`); `body-lg` desc; `RecipeTags`; time row `Clock` + `{minutes} minutes` + optional `Prep:`/`Cook:` |
| Detail body grid | `grid gap-6 lg:grid-cols-3` — Ingredients `lg:col-span-1`, Instructions `lg:col-span-2` (both `Card p-6 shadow-sm`) |
| Servings stepper | outline icon `Button` (`Minus`/`Plus`, min 1) around `h4` count; `factor = servings / recipe.servings` scales amounts via `scaleAmount` (2-dp) |
| Ingredient row | `label flex items-start gap-3` + shadcn `Checkbox` (`mt-0.5`); checked → `text-muted-foreground line-through` |
| Instruction step | numbered `size-7 rounded-full bg-primary text-primary-foreground` badge + `body-base text-muted-foreground` (cf. `RecipeResult` `size-6`) |
| Nutrition / Tips | reuse `RecipeResult` shapes — `NutritionBox` (`rounded-lg bg-muted p-3`, 5-col grid) + tips `Card bg-primary-subtle p-6` |

**Pattern notes:** thin Server pages — `/recipes` renders client `RecipesView` (search + 2 selects + client-side delete over **mock** `SAVED_RECIPES`); `/recipes/[id]` is a **Server Component** that `await`s async `params`, looks up via `getSavedRecipe`, `notFound()`s, and renders client `RecipeDetailView`. The shared `RecipeTags` is the single source for cuisine/difficulty/diet chips (reuse it — don't re-derive tones). `Recipe` type extended with optional `dietTags`/`prepMinutes`/`cookMinutes` (additive — `RecipeResult` + generate flow unchanged). A **link styled as a button** uses `buttonVariants()`, never `Button` around `Link`. Delete is mock (list filter / nav away) until the `/recipes` API exists.

### Meal Planner — weekly calendar (`features/meal-planner`)

Files: `MealPlannerView` (client) · `RecipePickerDialog` · `lib/week.ts` · `constants.ts`
Last updated: 2026-06-28

| Property | Class / note |
| -------- | ------------ |
| Week-nav bar | `rounded-xl border border-border bg-surface p-4 shadow-sm`; range `h4` + count `body-sm`; prev/next outline icon `Button`s flanking a "This Week" `Button` (active → `default`, else `outline`) |
| Calendar grid | `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7` — **day columns** (not a label-column table) so it stacks cleanly |
| Day column | `rounded-xl border border-border bg-surface p-3 shadow-sm`; header weekday `body-base semibold` + date pill `size-7 rounded-full` (today `bg-primary text-primary-foreground`, else `bg-muted text-muted-foreground`) |
| Slot label | `caption` + lucide icon (Breakfast `Coffee` · Lunch `Sun` · Dinner `Moon`), `text-muted-foreground` |
| Filled slot | `group relative rounded-lg border border-primary/20 bg-primary/5 p-2.5`; title `body-sm` `line-clamp-2`; mins `caption`; absolute `X` remove (`hover:text-destructive`) |
| Empty slot | dashed `border border-dashed border-border py-3` button, `+ Add`, `hover:border-primary/40 hover:text-primary` |
| Picker dialog | shadcn `Dialog`; search `Input` (`pl-9`) + scrollable `max-h-80` list of recipe buttons (title + cuisine·difficulty + mins), `hover:border-primary/40 hover:bg-primary/5` |

**Pattern notes:** thin Server page → client `MealPlannerView`. **Mock, in-memory** plan: `Record<\`${iso}-${slot}\`, Recipe>` keyed via `slotKey()`; week math in `lib/week.ts` (Monday-anchored, `weekOffset` state, `new Date()` only in the client). Recipes to assign come from `SAVED_RECIPES`. Assign/remove are local until the `/meal-planner` API (Phase 7). Slots mirror the backend `MealSlot` enum.

### Shopping List (`features/shopping`) — design-matched (`shoppingList.png`)

Files: `ShoppingView` (client) · `ShoppingItemRow` · `AddShoppingItemDialog` · `schemas/` + `types/` + `data/`
Last updated: 2026-06-28

| Property | Class / note |
| -------- | ------------ |
| Header | `display-lg` title + dynamic `body-lg text-muted-foreground` subtitle "**X of Y items checked**" (no progress bar — count only). Header lives in the **client** view because the count is reactive. |
| Action toolbar | `flex flex-wrap gap-3`; **Add Item** primary `Button` (`Plus`, always); **Add to Pantry (N)** `Button className="bg-info text-info-fg hover:bg-info-hover"` (blue, **only when `checkedCount > 0`**, N = checked count — bulk-promotes checked); **Clear Checked** outline `Button` (`Trash2`, only when `checkedCount > 0`) |
| Category card | `Card overflow-hidden shadow-sm`; header band `border-b border-border bg-muted/40 px-5 py-3` with `h5` name; rows wrapped in `divide-y divide-border` (no per-row borders) |
| Item row | `label flex items-center gap-4 px-5 py-4`; `Checkbox` `size-5`; name `body-lg medium` (checked → `text-muted-foreground line-through`) + qty `body-sm`. **No per-row buttons** — actions are the global toolbar. |
| Add dialog | shadcn `Dialog` + RHF + Zod (`schemas/shopping.schema.ts`); **Item Name** `Input`, then **Quantity** (number, `valueAsNumber`) + **Unit** `Select` side-by-side (`grid-cols-2`), then **Category** `Select` (`Controller`). Stored `quantity` = `` `${quantity} ${unit}` ``. Mirrors the Pantry `AddItemDialog`. Units come from the **shared** `@shared/constants/units` (`MEASUREMENT_UNITS`) — pantry + shopping reuse one source, default `"Pieces"`. |
| Empty state | `rounded-xl border border-dashed border-border bg-surface p-12 text-center` + `ShoppingCart` icon |

**Pattern notes:** thin Server page (`<ShoppingView/>` only) → client view owns header + state. **Mock** `SHOPPING_ITEMS` grouped by **distinct categories sorted alphabetically** (matches the mock's Dairy → Meat → Produce). Check-off is the only per-row interaction; **bulk** "Add to Pantry" (toast + removes checked, the Phase 8 `to-pantry` promotion) and "Clear Checked" operate on all checked items. Blue bulk button uses the `info` token (`bg-info`/`text-info-fg`/`hover:bg-info-hover`). All client-side until the `/shopping` API exists.

### Settings (`features/settings`) — design-matched (`settingspage1-3.png`)

Files: `SettingsCard` · `ProfileSection` · `PasswordSection` · `PreferencesSection` · `schemas/settings.schema.ts`
Last updated: 2026-06-28

| Property | Class / note |
| -------- | ------------ |
| Section card | `SettingsCard` = `Card p-6 shadow-sm sm:p-8`; header `flex items-center gap-3 mb-6`: optional **icon well** `size-10 rounded-xl` (`primary` = green `bg-primary/10 text-primary`, `info` = blue `bg-info/10 text-info`) + `h4` title |
| Profile | green `User` well; RHF + Zod (`profileSchema`) Name + Email `Field`s; prefilled from `useAuthStore` (`values`, name derived from email local-part); **Save Profile** primary `Button` (`Save` icon, `w-fit`) |
| Password | blue `Lock` well; RHF + Zod (`passwordSchema`, `.refine` match) Current/New/Confirm `Field`s (`type="password"`); **Change Password** blue `Button` (`bg-info text-info-fg hover:bg-info-hover`); `reset()` on success |
| Preferences | no icon well; **Dietary Restrictions** multi-select pills (`DIETS`), **Allergies** free-text `Input`, **Preferred Cuisines** single-select pills (`CUISINES`), **Default Servings** `Slider` 1–12 (label `Default Servings: {n}` + min/max), **Measurement Unit** 2-up segmented control (`grid-cols-2`, active `bg-primary text-primary-foreground`); **Save Preferences** primary `Button` |
| Pill | `rounded-lg px-4 py-2 text-body-base font-medium`; active `bg-primary text-primary-foreground`, idle `bg-muted text-muted-foreground hover:bg-surface-raised hover:text-foreground` (shared w/ generator) |

**Pattern notes:** thin Server page (`max-w-3xl`) stacks three **independent client sections**, each with its own Save button + toast (no parent orchestrator — sections are self-contained). Profile/Password reuse the **auth form pattern** (RHF + Zod + `Field` + `toast.loading`→success). Preferences reuses **`DIETS`/`CUISINES` from `@features/generator/constants`** and the generator's pill + `Slider` patterns (no duplication). All saves are **mock** (toast only) until the Phase 3 users/preferences endpoints exist. Restrictions are multi-select (mirrors the generator's dietary pills); cuisine is single-select (mirrors the generator's single cuisine).

---

## Baseline — light theme

The app is **light by default** (see ui-tokens.md). Every new component should match these. Values
are token classes — never hex or raw Tailwind colours. This baseline will be enriched via
`/imprint` as real features land.

| Property | Correct class |
| -------- | ------------- |
| Page background | `bg-background` (charcoal-black-900) |
| Card / panel background | `bg-card` / `bg-surface` (`#1a2329`) |
| Raised / muted surface | `bg-surface-raised` / `bg-muted` |
| Soft brand surface | `bg-primary-subtle` |
| Card / panel border | `border border-border` (`#242b32`) |
| Input border | `border-input` |
| Active / highlight border | `border-primary` (emerald-teal) |
| Focus ring | `ring-ring` (emerald-teal) |
| Shadow | `shadow-sm` (raised panels, pills); `shadow-md` (floating/dialogs) |

### Radius scale (intentional hierarchy — match by element type)

| Element type | Radius |
| ------------ | ------ |
| Badge / status tag | `rounded-md` |
| Card, input | `rounded-lg` |
| Recipe / panel card, media | `rounded-xl` |
| Large panel / dialog | `rounded-2xl` |
| Pill nav, CTA, avatar, checkbox | `rounded-full` |

### Typography

| Role | Class |
| ---- | ----- |
| Page title | `text-h1`/`text-h2` `font-bold text-foreground` |
| Section / card title | `text-h4`/`text-h6 font-semibold text-foreground` |
| Body / description | `text-body-sm`/`text-body-base` `text-muted-foreground` |
| Tiny labels (tags, dates, units) | `text-caption` / `text-label-sm` — **never** arbitrary `text-[Npx]` |

### Color

- Brand / links / active states: `text-primary` (emerald-teal).
- Body text: `text-foreground` (near-white) primary, `text-muted-foreground` secondary.
- Status: `warning`/`danger` for expiry + low-stock; `success` for fresh/saved/done.
</content>

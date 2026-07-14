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
| PasswordInput | `ui/password-input.tsx` | **Composite** (not shadcn): `Input` + eye/eye-off toggle button (`pr-10`, button absolute right) that flips `type` password↔text. Forwards all Input props incl. `register()`. Used by Login/Signup (and available for Settings). |
| Textarea | `ui/textarea.tsx` | forwardRef `<textarea>`; mirrors `Input`, `min-h-24`, `aria-invalid:border-destructive`. |
| Label | `ui/label.tsx` | `<label>`, `text-body-sm font-medium text-foreground select-none`. Used by `Field`. |
| Field | `ui/field.tsx` | Wrapper: `Label` + control + `error` (`text-body-sm text-danger`); `flex flex-col gap-1.5`; optional muted `hint`. Use for every form field. |
| Typography | `ui/typography/` | Polymorphic text component (`typography.tsx` + styles/types/constants). **Not shadcn** — custom. **All content text goes through it** (variant + weight props); colour/layout via `className`. |
| Dialog | `ui/dialog.tsx` | **shadcn** (base-ui). `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle`/`DialogFooter`/`DialogClose`. Controlled via `open`/`onOpenChange`. `DialogContent` has a built-in ✕ close button — pass **`showCloseButton={false}`** to hide it (the ConfirmDialog does this). |
| Select | `ui/select.tsx` | **shadcn** (base-ui). `Select`/`SelectTrigger`/`SelectValue`/`SelectContent`/`SelectItem`. Controlled via `value`/`onValueChange`. With RHF use a `Controller`. |
| Checkbox | `ui/checkbox.tsx` | **shadcn** (base-ui). `checked`/`onCheckedChange`. `data-checked:bg-primary`. With RHF use a `Controller`. |
| Slider | `ui/slider.tsx` | **shadcn** (base-ui). Pass `value` as a **single-element array** for one thumb (`value={[n]}`, `onValueChange` returns an array). `min`/`max`/`step`. |
| DropdownMenu | `ui/dropdown-menu.tsx` | **shadcn** (base-ui), CLI-installed. `DropdownMenu`/`DropdownMenuTrigger`/`DropdownMenuContent`/`DropdownMenuItem`/`DropdownMenuSeparator`/`DropdownMenuLabel`. Used by `UserMenu`. |
| Avatar | `ui/avatar.tsx` | **shadcn** (base-ui), CLI-installed. `Avatar`/`AvatarImage`/`AvatarFallback`. Used for the user initial (`bg-primary text-primary-foreground`). |
| Skeleton | `ui/skeleton.tsx` | **shadcn**, CLI-installed (`animate-pulse rounded-md bg-muted`). **Use this for all loading placeholders** — pass geometry via `className` (e.g. `h-32 rounded-xl border border-border`). Used in every list/detail view's loading state. Do **not** hand-roll `animate-pulse bg-muted` divs. |
| Toaster | sonner (mounted in `GlobalHosts`) | The sonner `<Toaster>` is imported directly from `sonner` and rendered in `shared/components/GlobalHosts.tsx` (`position="top-right" richColors`), mounted once in the root `layout.tsx`. There is **no `ui/sonner.tsx`**. Call `toast.loading/success/error` anywhere. |

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
| Header bar | `sticky top-0 z-30 border-b border-border bg-surface`; inner `relative mx-auto flex h-16 max-w-7xl items-center px-6` (brand left, nav absolutely centered, actions `ml-auto` right) |
| Brand | logo well `flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary` + `text-h6 font-bold text-foreground` |
| Nav (centered) | `absolute left-1/2 hidden w-max -translate-x-1/2 items-center gap-1 lg:flex` — **`w-max`** is required so the absolute nav doesn't shrink-to-half-width and wrap labels |
| Nav link | `flex items-center gap-2 rounded-lg px-3 py-2 text-body-base font-medium` |
| Nav link (active) | `bg-primary/10 text-primary` |
| Nav link (idle) | `text-muted-foreground hover:bg-muted hover:text-foreground` |
| User avatar | `flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-label-base font-semibold` |
| Dropdown panel | `rounded-lg border border-border bg-popover p-1 shadow-md` |
| Content container | `main` `mx-auto w-full max-w-7xl px-6 py-8` |

**Pattern notes:** the `(app)` **layout (Server) wraps the client `AppShell`**, passing `{children}`
through so pages **stay Server Components** (children-slot). Active nav state from `usePathname`.
Nav items in `shared/config/app-nav.ts` (`{label, href, icon}`); nav is **centered** in the header.
`UserMenu` is now built on the **shadcn `DropdownMenu` + `Avatar`** (CLI-installed) — trigger is the
**avatar only** (no name, no chevron, no hover bg); the panel shows avatar + name + email, a separator,
and a red `Logout`. Auth via `useAuthStore`; hydration two paths (login/signup seed `setUser`;
`AppShell` `getMe` only when `status === "loading"`).

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

**Pattern notes:** multi-color icon wells (primary/blue/purple) are the dashboard accent. The
presentational cards (`StatCard`/`ActionCard`/`RecentRecipes`/`UpcomingMeals`) are unchanged, but the
page now renders a **client `DashboardView`** that fetches **real data** in one `Promise.all`
(`listRecipes` + `listPantry` + `listMealPlan` for the current week) → stats (counts), Recent Recipes
(latest 3, link to detail), Upcoming Meals (this week's first 3). Loading skeletons + empty states;
**all mock `data/*.data.ts` removed** (dashboard view types live in `features/dashboard/types/`).
`ComingSoon` is the stub for unbuilt nav routes.

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

## Global hosts + confirm-before-delete

Files: `shared/components/GlobalHosts.tsx` · `shared/components/ConfirmDialog.tsx` · `shared/stores/confirm.store.ts`
Last updated: 2026-06-28

- **`GlobalHosts`** (client) is mounted **once** in the root `app/layout.tsx` and renders the sonner
  **`<Toaster position="top-right" richColors />`** (it was previously never mounted —
  toasts didn't show) plus the **`<ConfirmDialogHost />`**.
- **Confirm dialog** is imperative: `confirm.store.ts` (zustand) exposes `confirm(options) → Promise<boolean>`
  and a single `ConfirmDialogHost` (built on the **`Dialog`** primitive, `sm:max-w-sm`) reads the store.
  Options: `{ title, description?, confirmLabel?, cancelLabel?, destructive? }` (`destructive` defaults
  **true** → red `Button variant="destructive"`; cancel is `outline`).
- **Every delete confirms** before acting — call site pattern:
  `const ok = await confirm({ title, description, confirmLabel: "Delete" }); if (!ok) return` then the
  optimistic mutation. Wired in: Pantry item, Recipe card (list), Recipe detail, Meal-plan slot remove,
  Shopping "Clear Checked". (Shopping "Add to Pantry" is a move, not a delete — no confirm.)

## Loading skeletons (content-shaped)

Last updated: 2026-06-28

Use the shadcn **`Skeleton`** (`ui/skeleton.tsx`, CLI-installed — `animate-pulse rounded-md bg-muted`)
for **every** loading placeholder. **Never** hand-roll `animate-pulse bg-muted` divs.

**Rule: skeletons mirror the real content's shape, not plain blocks.** Rebuild the actual layout
(same `Card`, grid, spacing) and swap each text/media element for a `<Skeleton>` sized to it. Pass
geometry via `className`; the pulse/colour come from the component.

| View | Skeleton shape (matches the real layout) |
| ---- | ---------------------------------------- |
| Shopping (`ShoppingView`) | **1** category `Card` → header bar + 4 rows of `size-5` checkbox + name (`h-4`) / qty (`h-3`) |
| Pantry (`PantryView`) | **6** `Card p-5` in the 3-col grid → title/category lines + `size-4` ✕ + quantity row + expiry line |
| Recipes (`RecipesView`) | **6** `Card` in the 3-col grid → `h-44` media well + title + 2 desc lines + tag pills + meta row + `h-px` separator + button row (`flex-1` + `size-8`) |
| Recipe detail (`RecipeDetail`) | back-link + header `Card p-8` (title/desc/tags/time) + `lg:grid-cols-3`: ingredients `Card` (6 lines) + instructions `Card` (5 × `size-7` numbered step + 2 lines) |
| Dashboard (`DashboardView`) | **3** stat `Card`s (`size-12` icon well + label/value) + **2** list `Card`s (header + 3 × `size-10` row) |
| Settings prefs (`PreferencesSection`) | label + 6 pill skeletons, label + input, label + 8 pills, 2-up `h-12` toggle, `h-9 w-40` save button |
| Generator prefs (`GeneratorForm`, `prefsLoading`) | **only the 3 preference controls** gate on the `getPreferences()` fetch: Cuisine → `h-9 w-full`, Dietary Restrictions → `DIETS`-many `h-8 w-20 rounded-lg` pills, Servings → `h-5 w-full` (label shows no number while loading). Ingredients card is not pref-driven → never skeletoned. |

**Pattern notes:** skeletons live inline in each view's `loading` branch (no separate skeleton
files), reusing the real component's container classes (`Card p-5`, the grid, `divide-y`, etc.).
Counts are fixed placeholders (e.g. 6 cards) — they don't reflect real data. The **only** retained
raw `animate-pulse` is the Generate page's loading **chef-hat icon** (an animated icon, not a skeleton).

## API integration pattern (all feature pages)

Every feature page is now wired to the NestJS API (mock `data/*.data.ts` layers removed).
The consistent shape — match it for any new data-backed view:

- **Service** in `features/<f>/api/<f>.service.ts`: thin typed functions over the shared
  `@lib/axios.config` instance (`withCredentials` → httpOnly cookies). Each returns unwrapped,
  typed domain data (`res.data.data`). Create payloads are `Omit<T, "id" | …server-set>`.
- **Fetch**: client view loads in a `useEffect` with an `active` cleanup flag; `loading` state
  drives a **content-shaped `Skeleton`** (see the "Loading skeletons" section above).
- **Empty vs. loading vs. error** are distinct: skeleton while loading; dashed-border empty panel
  when the list is genuinely empty; **error toast** via `getErrorMessage(error)` (never a silent
  fail). Detail pages also distinguish **404** (axios `response.status === 404`) from other errors.
- **Mutations**: create awaits the server row then prepends it; **delete/toggle are optimistic**
  (update state immediately, revert + toast on failure). Dialogs `await onAdd(...)` and only
  `reset()` + close on success, surfacing errors inline (RHF `isSubmitting` disables the submit).
- **Forms**: submit via `toast.loading(...)` → `toast.success/error(..., { id })` (auth pattern).

This keeps every page's states consistent and the backend the single source of truth. The
`AuthUser` type now includes `name`; the auth store seeds it from login/register/`getMe`.

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

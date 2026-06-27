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
| Typography | `ui/typography/` | Polymorphic text component (`typography.tsx` + styles/types/constants). **Not shadcn** — custom. Text goes through it (variant + weight props). |

### Shared composites (`src/shared/components`)

| Component | File | Notes |
| --------- | ---- | ----- |
| Logo · Navbar · Footer | `Logo.tsx` · `Navbar.tsx` · `Footer.tsx` | **Placeholder portfolio chrome** from the scaffold. To be replaced with PantryChef chrome: `(auth)` layout card + `(app)` sidebar/top-nav (Pantry, Generate, Recipes, Meal Planner, Shopping List, Preferences). Don't build on the portfolio framing. |

### Features (`src/features/*`)

_None built yet._ As features land, add their composites: auth forms (`features/auth`),
`PantryRow`/pantry form (`features/pantry`), generator filter controls (`features/generator`),
`RecipeCard`/`RecipeView` (`features/recipes`), weekly grid + `MealSlot`
(`features/meal-planner`), `ShoppingItemRow` (`features/shopping-list`), preferences form
(`features/preferences`).

---

## Baseline — dark theme

The app is **dark only** (see ui-tokens.md). Every new component should match these. Values
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

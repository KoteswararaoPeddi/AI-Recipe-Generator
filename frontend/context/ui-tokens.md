# UI Tokens

Design tokens for **PantryChef**, defined in `frontend/src/shared/styles/theme.css`
(imported by `app/globals.css`). The palette is an **emerald-teal** primary on a **light
neutral** base (white surfaces, slate text) — a clean, modern light UI. Use these exact tokens
throughout; never hardcode hex or use raw Tailwind color classes.

> Source of truth: `src/shared/styles/theme.css`. If a token changes there, update this file.
> The app is **light by default** — `:root` holds the **light** theme. A `.dark` block exists
> as an override (not currently activated; there's no theme toggle/`next-themes` wired). The
> resolved values in the tables below are the **light** values.

---

## How It's Structured

`theme.css` has layers (Tailwind v4 — no `tailwind.config.ts` for tokens):

1. **`@theme` foundation** — raw palette scales and the typography scale. These generate
   utilities like `bg-emerald-teal-500`, `text-charcoal-black-900`, `text-h2`. The foundation
   scales present:
   - `--color-emerald-teal-*` — **primary brand** (base `--color-emerald-teal-500: #20b286`)
   - `--color-charcoal-black-*` — **neutral / surfaces** (base dark `--color-charcoal-black-900: #0f1418`)
   - `--color-brand-*` (teal), `--color-neutral-*` (slate)
   - `--color-red-*`, `--color-amber-*`, `--color-green-*`, `--color-blue-*` (feedback)
   - `--color-surf-crest-*`, `--color-aqua-spring-*`, `--color-purple-*`, `--color-grey-*`
     (extra foundation scales, available but not part of the semantic set)
2. **`:root` semantic layer** — named CSS vars that point at the palette (`--primary`,
   `--secondary`, `--background`, `--surface`, `--foreground`, `--border`, `--ring`, …) **and**
   shadcn aliases (`--card`, `--popover`, `--muted`, `--accent`, `--destructive`,
   `--sidebar-*`). This is the **dark** theme — its values are the dark surfaces/text below.
3. **`@theme inline`** — bridges the semantic vars into Tailwind's `--color-*` namespace so
   utilities (`bg-primary`, `text-foreground`, `border-border`, `bg-card`, …) are generated,
   keeping them referencing the vars.

```tsx
// Correct — generated utility classes
className="bg-primary text-primary-fg"
className="bg-card text-foreground border-border"

// Correct — CSS variable directly when a utility doesn't fit
style={{ color: "var(--primary)" }}

// Never — hardcoded hex / raw Tailwind colors
className="bg-[#20b286] text-gray-400"
className="bg-emerald-500"
```

For conditional/merged classes, always use `cn` from `@lib/utils`.

---

## Semantic Tokens (use these in components)

The active theme is **light**. Values below are the resolved light values.

| Role                 | Utility examples                                | Value (via palette)              |
| -------------------- | ----------------------------------------------- | -------------------------------- |
| Primary (brand)      | `bg-primary` `text-primary` `border-primary`    | emerald-teal-500 `#20b286`       |
| Primary hover        | `bg-primary-hover`                              | emerald-teal-600 `#17936f`       |
| Primary subtle       | `bg-primary-subtle`                             | emerald-teal-50 `#eefbf7` (light mint) |
| On-primary text      | `text-primary-fg`                               | `#ffffff`                        |
| Secondary            | `bg-secondary` `text-secondary`                 | neutral-100 `#f1f5f9` (text neutral-900) |
| Danger / destructive | `bg-danger` / `bg-destructive`                  | red-600 `#dc2626`                |
| Warning              | `bg-warning`                                    | amber-500 `#f59e0b`              |
| Success              | `bg-success`                                    | green-600 `#16a34a`              |
| Info                 | `bg-info`                                       | blue-600 `#2563eb`               |
| Page background      | `bg-background`                                 | neutral-50 `#f8fafc` (light)     |
| Surface / card       | `bg-surface` / `bg-card`                        | white `#ffffff`                  |
| Raised / muted       | `bg-surface-raised` / `bg-muted`                | neutral-100 `#f1f5f9`            |
| Foreground text      | `text-foreground` / `text-card-foreground`      | near-black (neutral-900 `#0f172a`)|
| Muted text           | `text-muted-foreground`                         | mid-grey (neutral-500)           |
| Subtle text          | `text-subtle-foreground`                        | lighter grey (neutral-400)       |
| Border               | `border-border`                                 | neutral-200 `#e2e8f0`            |
| Strong border        | `border-border-strong`                          | neutral-300                      |
| Input border         | `border-input`                                  | neutral-200                      |
| Focus ring           | `ring-ring` / `outline-ring`                    | emerald-teal (primary)           |

Each colored role also has `-hover`, `-subtle`, and `-fg` variants (e.g. `bg-danger-subtle`,
`text-warning-fg`).

> Note on `accent`: the shadcn `--accent` alias maps to the raised surface, matching shadcn's
> "subtle hover" convention — it is **not** a vivid brand accent. For brand emphasis use
> `primary`. The extra foundation scales (`surf-crest`, `aqua-spring`, `purple`, `grey`) are
> available as raw utilities (`bg-aqua-spring-500`, …) but are **not** part of the semantic set
> — prefer semantic tokens. There is no `ocean-green` or `cyprus` scale (removed) — do not
> reference them.

---

## Typography Scale

Defined in `@theme` → generates `text-*` size utilities:

| Utility            | Size  |  | Utility           | Size |
| ------------------ | ----- |--| ----------------- | ---- |
| `text-display-2xl` | 52px  |  | `text-body-lg`    | 16px |
| `text-display-xl`  | 48px  |  | `text-body-base`  | 14px |
| `text-display-lg`  | 35px  |  | `text-body-sm`    | 12px |
| `text-h1`          | 29px  |  | `text-label-lg`   | 14px |
| `text-h2`          | 24px  |  | `text-label-base` | 12px |
| `text-h3`          | 20px  |  | `text-label-sm`   | 11px |
| `text-h4`          | 16px  |  | `text-caption`    | 11px |
| `text-h5`          | 14px  |  |                   |      |
| `text-h6`          | 12px  |  |                   |      |

Font family is **Poppins**, loaded via `next/font/google` in the root layout and exposed as
`--font-poppins`; `html` applies `font-sans` in `globals.css`. If `cn()` is used to merge a
custom `text-*` size token, that token must be registered in the `extendTailwindMerge` list in
`src/shared/lib/utils.ts` (so a size class is not conflated with a colour class and dropped).

---

## Radius

`--radius: 0.625rem` (10px). shadcn derives `rounded-sm/md/lg/xl` from it. Use the
`rounded-*` utilities, not arbitrary pixel radii.

---

## Theme — Light by Default

PantryChef ships a **light theme by default**. `:root` holds the light surfaces and text
(`--background` neutral-50 `#f8fafc`, `--surface`/`--card` white `#ffffff`, `--border`
neutral-200 `#e2e8f0`, `--foreground` near-black neutral-900). A **`.dark` block** in
`theme.css` overrides the same semantic vars with dark values — it's the future dark theme,
but **no toggle/`next-themes` is wired**, so the app renders light (no `.dark` class on `html`).

A `@custom-variant dark (&:is(.dark *))` is declared in `globals.css` so `dark:` utilities still
resolve under a `.dark` ancestor. Build with the **semantic tokens** so a component renders
correctly in either theme — never hardcode a light- or dark-specific colour.

---

## Invariants

- Never hardcode hex in components — use the token utilities (or `var(--token)` when a utility
  doesn't fit). The one sanctioned hex path is a data-driven decorative colour applied via
  `style={{ … }}` (component chrome still uses tokens).
- Never use raw Tailwind color classes (`bg-emerald-500`, `text-gray-400`) — only project tokens.
- Primary brand is emerald-teal (`primary`); `secondary` is a light neutral. Don't swap in
  Tailwind's built-in green/teal scales.
- The app is **light by default**. Use semantic tokens so components render correctly in
  either theme; don't author a light- or dark-only colour. The decorative dashboard icon wells
  use `bg-{primary,info}/10` plus the `purple-500` foundation scale (a sanctioned one-off).
- Borders default to `border-border`; use `border-strong` for stronger edges, `border-input`
  for form fields. Never `border-gray-*`.
- Prefer semantic tokens over raw palette utilities; reach for a raw scale
  (`bg-emerald-teal-200`) only for a one-off decorative need.
- Radius comes from `--radius` via `rounded-*` — don't hardcode pixel radii.
- Dark only — never author a light-mode-specific colour or add a theme toggle.

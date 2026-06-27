# UI Rules

How PantryChef's UI should look, behave, and read. Pairs with ui-tokens.md
(colors/typography) and ui-registry.md (built components). Keep every page visually
consistent — shared tokens and primitives, one set of conventions, one dark theme.

---

## Layout

- **Two layout shells.** `(auth)` pages (login/signup) are a centered card on the dark
  background, no app chrome. `(app)` pages share a persistent shell: a **sidebar or top nav**
  (Pantry, Generate, Recipes, Meal Planner, Shopping List, Preferences) plus a main content
  area in a centered container with comfortable padding.
- **Navigation is route-based** — each app area is its own route under `(app)`. The active
  route is reflected in the nav.
- Build **responsive**: the sidebar collapses to a drawer/bottom nav on mobile; tables and
  grids reflow to fewer columns or stacked cards; the meal-planner week grid scrolls or stacks.
  Verify mobile, tablet, and desktop.

---

## Cards & Surfaces

- Content panels (recipe cards, pantry rows, planner slots, the auth card) use `bg-card` with
  `border border-border` and a `rounded-lg`/`rounded-xl` radius (from `--radius`); add a subtle
  shadow for raised/floating elements.
- Page background is `bg-background` (the dark charcoal base); raised/muted panels use
  `bg-surface-raised` / `bg-muted`.
- Keep card chrome quiet so content (recipe titles, ingredients, nutrition) stands out.

---

## Components (use shadcn primitives)

- Build on the primitives in `src/shared/components/ui` (button, card, input, label, textarea,
  select, badge, table, tabs, dialog, …). Don't hand-roll equivalents. Add new primitives via
  the shadcn CLI when a feature needs one.
- Promote a feature component to `shared/components` only once a second feature needs it.
- Buttons: `primary` for the main action (Generate recipe, Save recipe, Add item, Log in), an
  outline/quiet variant for secondary actions, ghost for tertiary. One primary action per view.
- Every form uses label + control + inline error, driven by RHF + Zod (see code-standards.md).

---

## Color & Type Usage

- Follow ui-tokens.md. Brand actions, links, and active states use `primary` (emerald-teal).
  Feedback uses `success`/`warning`/`danger`/`info`. Everything sits on the dark base.
- **Status semantics:** expiry "past/soon" and low-stock use `warning`/`danger` badges; a
  fresh/in-stock or saved state uses `success`. Be consistent across pantry and shopping.
- Use the typography scale (`text-display-*`, `text-h1`…`text-h6`, `text-body-*`,
  `text-label-*`) rather than arbitrary sizes. Page titles use `text-h1`/`text-h2`; card titles
  use `text-h4`; body stays at `text-body-base`.
- Never hardcode hex or use raw Tailwind color classes.

---

## Page patterns

- **Auth (login/signup):** a single centered card — logo, heading, the form (email/password),
  primary submit, and a link to the other auth page. Inline errors; submitting state.
- **Pantry:** a table/list of items (name, quantity, unit, expiry) with an "Add item" form or
  dialog. **Expiry alerts** and **low-stock badges** sit on each row. Empty state guides the
  user to add their first ingredient.
- **Generate:** diet + cuisine **filter controls** (pre-filled from preferences), a "Generate
  recipe" primary action, and a clear **loading** state while Gemini responds. The result hands
  off to the recipe view.
- **Recipe view:** title + meta (cuisine, diet, difficulty, servings), ingredients list,
  numbered step-by-step instructions, a nutrition block (optionally a small chart), and AI
  cooking tips. Primary actions: Save, and Add missing to shopping list.
- **Recipe collection:** a responsive grid of `RecipeCard`s with a **search** field and
  **cuisine / difficulty** filters. Uniform card height and chrome.
- **Meal planner:** a weekly grid (7 days × Breakfast/Lunch/Dinner), week-to-week navigation,
  and slots that hold an assigned recipe (or an empty "add" affordance).
- **Shopping list:** rows with a checkbox to **check off**, and a one-click **add to pantry**
  action per item. Checked items read as done without disappearing abruptly.
- **Preferences:** a small form for default diet + cuisine with a clear save confirmation.

---

## States (every data view)

Unlike a static site, every page reads/writes through the API — so handle all states:

- **Loading:** skeletons or a spinner while fetching/generating. Generation can be slow — show
  clear progress and disable the trigger while it runs.
- **Empty:** guide the user to the next action ("No items in your pantry yet, add one to get
  started.", "No saved recipes yet, generate one.").
- **Error:** a human-readable message with a retry where sensible. **AI errors** must never
  break the page — show a friendly fallback and keep the rest usable.
- **Forms:** inline validation errors (what's wrong + how to fix), a disabled/submitting state,
  and a success confirmation (toast via sonner).
- **Images:** meaningful `alt` text; use `next/image`.

---

## UX Writing / UI Content Standards

Standards for UI copy — button labels, form labels, errors, empty states, toasts, headings.
Good UI content tells users what to do, what happened, and what happens next. Apply these
everywhere; consistency matters more than any single choice.

### 1. Be clear, not clever

- ❌ "Let's get cooking!" · "Time to embark on your culinary journey."
- ✅ "Create account" · "Generate recipe"

### 2. Use action-oriented button labels

- ❌ Submit · Click here · Continue (when the action is unclear)
- ✅ "Generate recipe" · "Save recipe" · "Add to pantry" · "Add item"

### 3. Keep labels short

- ❌ "Please enter the name of the ingredient"
- ✅ "Ingredient"

### 4. Error messages explain the problem

- ❌ "Invalid input"
- ✅ "Enter a valid email address." · "Quantity must be 0 or more."

### 5. Empty states guide the user

- ❌ "No data found."
- ✅ "No saved recipes yet, generate one to get started."

### 6. Success messages confirm completion

- ❌ "Success!"
- ✅ "Recipe saved" · "Added to pantry"

### 7. Avoid unnecessary punctuation

No trailing periods in short UI text (buttons, labels, toasts). Periods are fine for longer
sentences in descriptions/body copy.

- ✅ Button: "Save recipe" / ❌ "Save recipe."
- ✅ Toast: "Recipe saved" / ❌ "Recipe saved."

**Never use a long hyphen (em dash `—` or en dash `–`) in UI content.** Use a comma, or
rewrite as a separate sentence.

### 8. Maintain consistency

Pick one term and use it everywhere — don't mix "Generate recipe" with "Create" or "Make a
recipe"; don't mix "Pantry" with "Inventory".

### 9. Use sentence case

- ✅ "Generate recipe" · "Add to pantry" · "Meal planner"
- ❌ "Generate Recipe" · "Add To Pantry"

### 10. Reduce cognitive load

Don't make users read more than necessary; write a single, refined thought.

---

## Do Nots

- **Never use a long hyphen (em dash `—` or en dash `–`) in UI content** (labels, buttons,
  headings, body copy). Use a comma, or rewrite as a separate sentence.
- Never use raw Tailwind color classes (`bg-emerald-500`, `text-gray-400`) — use tokens only.
- Never define colors in a config file — tokens live in `theme.css` (`@theme`).
- Never author a light-mode-only colour or add a theme toggle — the app is dark only.
- Never ship a form without validation, a submitting state, and a success/error message.
- Never let an AI failure break a page — always show a friendly fallback.
- Never put business logic or data fetching in a `page.tsx` — compose feature components.
</content>

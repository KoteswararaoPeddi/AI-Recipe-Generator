# Project Overview

## About the Project

**PantryChef** is an **AI Recipe Generator** — a full-stack web app that turns the
ingredients a user already has into cookable recipes. The user keeps a digital **pantry**,
tells the app what they feel like eating (diet, cuisine), and the app generates complete
recipes with **Google Gemini 2.5 Flash** — ingredients, step-by-step instructions,
nutrition, and cooking tips. Recipes worth keeping are saved to a personal collection,
dropped onto a weekly meal plan, and turned into a shopping list that feeds right back into
the pantry.

The app is split into two deployables:

```
frontend/   → Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/ui
backend/    → NestJS + Prisma + PostgreSQL  (REST API, JWT auth, Google Gemini)
```

The frontend never talks to Gemini or the database directly. It calls **our own** NestJS
API; the API owns authentication, persistence, and every AI call. The `GEMINI_API_KEY`
lives only on the backend.

---

## The Problem It Solves

People throw food away because they don't know what to cook with it, and they reach for the
same handful of meals because thinking up something new is work. PantryChef removes both
frictions: it knows what's in your kitchen, respects how you eat, and produces a full recipe
on demand. From there it closes the loop — save the good ones, plan the week, and generate
the shopping list for whatever the pantry is missing.

---

## Core User Flow

```
Sign up / log in
      ↓
Stock the pantry (ingredients, quantities, expiry dates)
      ↓
Set preferences (default diet + cuisine)  ──pre-fills──┐
      ↓                                                 │
Generate a recipe  ←─── diet & cuisine filters ─────────┘
   (Gemini reads the pantry + filters)
      ↓
View the recipe (ingredients, steps, nutrition, AI tips)
      ↓
Save it → Recipe Collection (search / filter)
      ↓
Add saved recipes to the Meal Planner (Breakfast / Lunch / Dinner, by week)
      ↓
Build a Shopping List → check items off → add bought items back to the pantry
```

---

## Features In Scope

1. **User Authentication** — email/password sign-up and login. Passwords hashed with
   **bcryptjs**; sessions carried by **JWT**. Every data-bearing route is per-user.
2. **Pantry Management** — track ingredients with quantity, unit, and expiry date.
   **Expiry alerts** flag items nearing/past their date; **low-stock badges** flag items
   running out.
3. **AI Recipe Generation** — generate complete recipes from the current pantry via
   **Google Gemini 2.5 Flash**, respecting the active diet and cuisine filters.
4. **Dietary & Cuisine Filters** — Vegetarian, Vegan, Keto, Paleo, Gluten-Free, plus 10+
   cuisines (Italian, Mexican, Indian, Chinese, Thai, Japanese, Mediterranean, …).
5. **Recipe View** — ingredients, step-by-step instructions, nutrition info (calories /
   macros), and AI-generated cooking tips.
6. **Recipe Collection** — save recipes; search by text and filter by cuisine and
   difficulty.
7. **Meal Planner** — a weekly calendar with Breakfast / Lunch / Dinner slots and
   week-to-week navigation; assign saved recipes to slots.
8. **Shopping List** — check items off, and add a bought item straight into the pantry in
   one click.
9. **User Preferences** — set a default diet and cuisine that pre-fill the recipe generator.
10. **Responsive UI** — modern, responsive design with Tailwind CSS across mobile, tablet,
    and desktop.

---

## Features Out of Scope

- Payments, subscriptions, or any billing.
- Social features (sharing, following, public recipe feeds, comments).
- Grocery-delivery / store integrations or real-time pricing.
- Barcode/photo ingredient scanning (the pantry is entered manually).
- A native mobile app (the web app is responsive instead).
- Multi-tenant / household sharing — each account is a single user's kitchen.

---

## Target Audience

- **Home cooks** who want to cook from what they already have and waste less food.
- **People with dietary constraints** (vegan, keto, gluten-free, …) who want recipes that
  respect them without manual filtering.
- **Weekly meal planners** who want generation, saving, planning, and shopping in one place.

---

## Success Criteria

- A new user can sign up, stock a pantry, and generate a usable recipe in a few minutes.
- Generation honours the active diet and cuisine filters and draws on real pantry items.
- Expiry and low-stock signals are visible at a glance in the pantry.
- Saved recipes are easy to find again (search + cuisine/difficulty filters).
- The weekly planner and shopping list make the save → plan → shop loop feel effortless.
- The UI is consistent (shared tokens and components) and responsive on every breakpoint.
- AI failures degrade gracefully — the rest of the app keeps working when Gemini is down.
</content>
</invoke>

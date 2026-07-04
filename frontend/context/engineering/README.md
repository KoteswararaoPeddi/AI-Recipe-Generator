# Engineering Decision Log — Index

> A running record of the **notable engineering decisions and techniques** used in this project —
> the non-obvious "why I did it this way" choices, split by tech domain so no single file gets clumsy.
>
> **Not** part of the context pre-read pipeline. These are reader-facing records (for you, reviewers,
> recruiters) of what was already built — not inputs that steer future implementation.

## Files

| File | Covers |
| --- | --- |
| [frontend.md](./frontend.md) | Next.js/React — rendering strategy, performance, state, UX & accessibility |
| [backend.md](./backend.md) | NestJS — module/service structure, API design, error handling |
| [database.md](./database.md) | Prisma & Postgres — schema, queries, N+1, indexing, migrations (learning-focused) |
| [auth-security.md](./auth-security.md) | JWT/sessions, guards, validation, rate limiting, secrets |
| [ai.md](./ai.md) | Gemini integration — prompts, structured output, streaming, cost/retries |
| [ai-agents.md](./ai-agents.md) | Agent design (added when agents are built) |
| [mcp.md](./mcp.md) | MCP servers (added when introduced) |

## Entry template

Append a new entry under the matching category in the relevant file after each task:

```
### [Feature] — [Technique / Decision]
- **What:**   the technique or approach used
- **Where:**  file / component / module
- **Why:**    the problem it solves / the alternative that was rejected
- **Approved:** (perf optimizations only) date + that it was signed off before being applied
- **Learn**   (see the 5-part shape below)
```

**These docs are written to teach.** Every *substantive* entry carries a `Learn` block. Only **pure
facts** with no transferable lesson stay terse (a one-line What/Where/Why + a `(no lesson)` note) — e.g.
a naming convention, "no seed script yet," which enums exist.

**The `Learn` block — 5 parts** (skip a part only when it genuinely doesn't apply):

````
- **Learn**

  **Vocabulary:** define any jargon the entry uses, from scratch (only for concept-heavy entries —
  a plain `Promise.all` needs none).

  ```ts
  // ❌ naive / wrong — the tempting approach and why it hurts
  ...
  // ✅ what we did — the real code from this repo (trimmed for teaching)
  ...
  ```

  Plain-english **why** the ✅ version beats the ❌ one — no undefined terms.

  **Where else you'd use this:** 3–4 *other* real situations the same pattern fits (this is what makes
  the entry a transferable lesson, not a one-off fact).

  **Rule of thumb:** the one-line takeaway — when to reach for this, and when not to.
````

Keep snippets **short** (❌ vs ✅ contrast, not full files) and grounded in this repo's actual code.

## Rules

- **Split on growth:** when any file gets too long, promote a section to its own file (or folder).
- **Perf is approval-gated:** performance optimizations are logged here only **after** they're approved
  — they are proposed first, never applied silently.

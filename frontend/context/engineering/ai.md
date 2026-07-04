# AI Integration — Engineering Decisions (Gemini)

> Notable AI-integration decisions, written to **teach**. Format: vocabulary (if needed) → ❌ naive vs
> ✅ our code → why → **where else you'd use it** → rule of thumb. See [README](./README.md).
> All code under `backend/src/modules/recipes/ai/` plus `recipes.service.ts`.
> **SDK:** `@google/genai` 2.10 (the unified Google Gen AI SDK, not legacy `@google/generative-ai`).
> **Model:** config-driven, default `gemini-2.5-flash`.

## Prompt Design & Structured Output

### Enforced JSON via `responseSchema` (not free-text parsing)
- **What:** A `RECIPE_SCHEMA` (`Type.OBJECT` …) is passed with `responseMimeType: "application/json"`, so Gemini returns exactly the recipe shape.
- **Where:** `backend/src/modules/recipes/ai/gemini.service.ts:9-45,83-87`.
- **Why:** The model is constrained to the target schema at generation time — no brittle regex/free-text extraction.
- **Learn**

  **Vocabulary:** *structured output* = asking the model to return machine-readable JSON matching a schema
  you declare, instead of free-form prose.

  ````ts
  // ❌ ask for JSON in the prompt and hope — the model may wrap it in prose or ```json fences, add a
  //    trailing comment, or omit a field. Now you're regex-scraping model output.
  const text = await ai.generate("Return the recipe as JSON: ...")
  const recipe = JSON.parse(text.match(/\{[\s\S]*\}/)[0])   // fragile

  // ✅ declare the exact shape; the SDK constrains generation to it
  const RECIPE_SCHEMA = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, servings: { type: Type.INTEGER }, /* … */ },
                          required: ["title", "description", "ingredients", "steps", "nutrition"] }
  const response = await ai.models.generateContent({
    model, contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: RECIPE_SCHEMA, temperature: 0.8 },
  })
  const recipe = JSON.parse(response.text)   // guaranteed JSON in the declared shape
  ````

  Structured output moves the contract from the *prompt* (a polite request) to the *API config* (an
  enforced constraint). You get valid JSON in the right shape instead of text to scrape. It doesn't
  guarantee good *values* (a number can still be nonsense — hence the `normalize()` pass next), but it
  eliminates the whole "the JSON didn't parse" failure class.

  **Where else you'd use it:** any time an LLM result feeds *code* rather than a human — extraction
  (pull fields from a document), classification (return `{ category, confidence }`), form-filling, tool/
  function calling. The same idea as JSON mode / function calling across LLM providers.

  **Rule of thumb:** LLM output consumed by code → always use structured output / a response schema, and
  still validate the values downstream. Prompt-and-hope JSON parsing is the #1 source of flaky AI
  integrations.

### Prompt injects existing titles for de-duplication + constrains ingredients
- **What:** The prompt injects up to 40 of the user's saved recipe titles ("make something different") and restricts recipes to provided ingredients + basic staples. Saved titles + pantry names are fetched in parallel to build it.
- **Where:** `backend/src/modules/recipes/ai/recipe-prompt.ts:29-34`; `recipes.service.ts:20-30`.
- **Why:** Stops the model repeating recipes the user already has, and keeps output grounded in their actual pantry.
- **Learn**

  ````ts
  // The prompt is DYNAMIC — built from live app state, not a static string.
  const prompt = `Create a recipe using ONLY these ingredients (plus basic staples): ${pantry.join(", ")}.
  Do NOT duplicate any of the user's existing recipes: ${savedTitles.slice(0, 40).join(", ")}.`
  // context (pantry names + existing titles) is fetched in parallel, then injected:
  const [pantry, savedTitles] = await Promise.all([this.pantry.names(userId), this.recipes.titles(userId)])
  ````

  This is **prompt engineering as context injection**: the quality of an LLM answer depends heavily on the
  context you give it. Feeding the model the user's pantry *grounds* it (no recipes calling for
  ingredients they don't have), and feeding it existing titles with a "don't repeat" instruction prevents
  boring duplicates. The prompt is assembled from live DB data per request, not hardcoded.

  **Where else you'd use it:** RAG (retrieval-augmented generation — inject fetched documents so the model
  answers from *your* data), personalization (inject user history/preferences), grounding a chatbot in the
  current page/record. Constraint + relevant context beats a clever one-line prompt almost every time.

  **Rule of thumb:** the leverage is in the *context*, not the wording. Fetch and inject the specific
  data the model needs to be grounded and non-repetitive; assemble prompts from live state.

### Defensive normalization of untrusted AI JSON
- **What:** `normalize()` coerces every field (numbers, string arrays) with fallbacks (`"Untitled Recipe"`, `servings = 2`) before the result reaches the mapper/DB.
- **Where:** `gemini.service.ts:126-163`.
- **Why:** Even with a response schema, a malformed/partial AI response can't break downstream mapping or violate DB constraints.
- **Learn**

  ````ts
  // Treat AI output as UNTRUSTED input — coerce and default every field before it touches the DB.
  const num = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback)
  return {
    title: String(raw.title ?? "Untitled Recipe"),      // missing/odd → safe default, never undefined
    servings: num(raw.servings, 2),
    ingredients: Array.isArray(raw.ingredients) ? raw.ingredients.map(cleanIngredient) : [],
    // …every field validated/coerced; nothing from the model is trusted verbatim
  }
  ````

  A response schema makes the *shape* likely-correct, but a model can still return `null`, a string where
  you wanted a number, or omit an "optional" field. **Defensive normalization** is the same principle as
  never trusting user input: validate and coerce at the boundary so the messy outside value can't violate
  a DB `NOT NULL`/type constraint or crash the mapper. Belt *and* braces with structured output.

  **Where else you'd use it:** parsing any external data — third-party API responses, webhook payloads,
  CSV imports, user uploads. Coerce to your types with sane fallbacks at the edge.

  **Rule of thumb:** treat LLM (and any external) output as untrusted. Validate/coerce every field with
  fallbacks before it enters your system, even when you also used a schema.

## Streaming & Responsiveness

> **None found.** Generation is a single request/response (no token streaming). The frontend shows a
> loading toast + skeleton during the call. *(Deliberate current state — logged so it's a known choice,
> not an oversight. If responses grew long, streaming tokens as they arrive would improve perceived speed.)*

## Cost, Reliability & Caching

### Model + temperature choice
- **What:** Default model `gemini-2.5-flash` at `temperature: 0.8`.
- **Where:** `gemini.service.ts:86`, default in `configuration.ts:20`.
- **Why:** Flash is the cheap/fast tier — appropriate for high-volume recipe generation; 0.8 gives varied output without going incoherent.
- **Learn**

  **Vocabulary:** *temperature* controls randomness — low (0–0.3) = focused/deterministic, high (0.8–1) =
  varied/creative. Model *tiers* trade cost/latency for capability (Flash = fast/cheap, Pro = smarter/pricier).

  ````ts
  config: { model: "gemini-2.5-flash",   // fast + cheap: right for high-volume, not-mission-critical gen
            temperature: 0.8 }           // higher → different recipe each time (variety is the point here)
  ````

  Two knobs worth understanding. **Model tier**: don't reach for the biggest model reflexively — recipe
  generation is high-volume and forgiving, so the cheap/fast Flash tier fits (a reasoning-heavy task like
  code analysis might justify Pro). **Temperature**: match it to the goal — you *want* variety here (0.8),
  but you'd drop it near 0 for extraction/classification where you want the same answer every time.

  **Where else you'd use it:** pick the tier per task (cheap for bulk/simple, premium for hard/critical);
  set temperature low for structured extraction, high for brainstorming/creative copy.

  **Rule of thumb:** choose the *cheapest model that's good enough* for the task, and set temperature to
  match — low for correctness/consistency, high for creativity/variety.

### Retry-with-backoff that distinguishes transient vs. quota errors
- **What:** Retries only genuine overloads (`503/UNAVAILABLE/overloaded`) up to 3 attempts with `[600, 1800]ms` backoff, but **fails fast on quota** (`429/RESOURCE_EXHAUSTED`) with an actionable message.
- **Where:** `gemini.service.ts:74-120`.
- **Why:** Retrying a transient overload helps; retrying a quota error just burns more quota and delays the user.
- **Learn**

  **Vocabulary:** *transient* error = temporary, likely gone on retry (overload, network blip). *backoff*
  = wait longer between each retry so you don't hammer a struggling service.

  ````ts
  // ❌ retry EVERY failure the same way — a 429 "quota exceeded" gets retried 3×, each burning more of
  //    the quota that's already gone, and the user waits ~2.4s for a guaranteed failure.
  for (let i = 0; i < 3; i++) { try { return await ai.generate(prompt) } catch { await sleep(1000) } }

  // ✅ classify the error, then act per class
  catch (error) {
    const msg = String(error?.message ?? error)
    if (/\b429\b|RESOURCE_EXHAUSTED|quota/i.test(msg))                    // quota → retry can't help
      throw new ServiceUnavailableException("Daily AI limit reached. Try later or upgrade.")
    if (/\b503\b|UNAVAILABLE|overloaded/i.test(msg) && attempt < max) {   // overload → wait & retry
      await sleep([600, 1800][attempt - 1] ?? 1800); continue             // growing backoff
    }
    throw new ServiceUnavailableException("AI temporarily unavailable. Please try again.")
  }
  ````

  Not all failures are equal, and the key move is **classifying the error before deciding**. A transient
  503 is likely gone in a moment — retry with growing backoff. A 429 quota error is *not* transient
  (the limit is spent), so retrying wastes calls and delays an inevitable failure — fail fast with an
  actionable message. "Retry everything" and "retry nothing" are both wrong.

  **Where else you'd use it:** any flaky external dependency — payment gateways, third-party APIs, network
  calls. Retry transient/5xx/network with backoff (+ jitter under load); fail fast on permanent errors
  (4xx auth, bad-request, quota).

  **Rule of thumb:** classify before retrying. Retry only what a retry can fix (transient), with capped
  backoff; fail fast on permanent errors.

### Graceful degradation to a friendly 503
- **What:** Any failure (including unparseable JSON) throws `ServiceUnavailableException` with user-facing copy instead of a raw 500; documented as `503` on the controller.
- **Where:** `gemini.service.ts:60-72,111-119`; `recipes.controller.ts:33`.
- **Why:** Users see a clear "try again" message, never a stack-trace 500.
- **Learn**

  ````ts
  // Wrap ALL failure modes (network, quota, unparseable output) in ONE clear, user-facing 503.
  try { return this.normalize(JSON.parse(text)) }
  catch { throw new ServiceUnavailableException("The AI returned an unexpected response. Please try again.") }
  ````

  **Graceful degradation** = when a dependency fails, fail in a way the user can understand and act on,
  rather than exposing an internal error. `503 Service Unavailable` is the honest status for "our AI
  provider is having a moment" — paired with human copy, it turns a scary crash into a "try again." Note
  this composes with the leak-proof filter idea from [backend.md](./backend.md): known, intentional error
  out; internals to the logs.

  **Where else you'd use it:** any feature backed by a flaky/optional dependency — search, recommendations,
  third-party widgets. Degrade to a friendly message (or a cached/fallback result) instead of a 500.

  **Rule of thumb:** convert dependency failures into honest, actionable user-facing errors (right status
  + human copy). Never let a raw exception reach the user.

### AI results are not cached / not persisted until saved
- **What:** Generated recipes are intentionally not persisted (id stays `""` until the user saves); every generate call hits Gemini fresh. No response cache.
- **Where:** `recipes.service.ts:19-33`.
- **Why:** Generation is meant to be novel each time (reinforced by the de-dup prompt); caching would fight that.
- **Learn**

  Caching is usually a win — but here it would be a **bug**. The whole point is a *fresh, different*
  recipe each time (temperature 0.8 + the "don't duplicate" prompt); serving a cached result would defeat
  the feature. And an unsaved recipe is ephemeral (id `""`) until the user explicitly saves it, so there's
  nothing to persist yet. The lesson: **caching is a trade-off, not a default** — it's right for stable,
  repeatedly-requested, expensive-to-compute data, and wrong for intentionally-varying output.

  **Where else you'd cache (and where not):** cache stable, hot, expensive reads (config, product
  catalogs, computed aggregates). *Don't* cache intentionally-random output, per-request personalized
  results, or rapidly-changing data. The **trade-off** to weigh: cost/latency saved vs. staleness risk.

  **Rule of thumb:** cache stable + expensive + frequently-requested data. Don't cache output that's
  *supposed* to change each call. Ask "is a slightly stale answer acceptable here?" — if no, don't cache.

> **Gap flagged:** there is **no explicit app-level request timeout** on the Gemini call — retries/backoff
> exist, but a hung request isn't bounded by a timeout. Worth adding before production.

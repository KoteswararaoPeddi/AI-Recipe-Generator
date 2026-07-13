# Auth & Security — Engineering Decisions

> Notable auth/security decisions, written to **teach**. Cross-cutting across frontend and backend.
> Format: vocabulary (if needed) → ❌ naive vs ✅ our code → why → **where else you'd use it** → rule of
> thumb. See [README](./README.md). The frontend refresh-queue is also in [frontend.md](./frontend.md).

## Authentication

### JWT access + refresh with rotation, secrets passed per-sign
- **What:** Two token types (access ~15m, refresh ~7d) signed with **different secrets/TTLs supplied at sign-time**, so a single empty `JwtModule.register({})` serves both.
- **Where:** `backend/src/modules/auth/auth.module.ts:16`, `auth.service.ts:85-101`; TTLs in `configuration.ts:12-17`.
- **Why:** One JwtModule handles two independent token contracts; access and refresh can be rotated/expired independently.
- **Learn**

  **Vocabulary:** a *JWT* is a signed token carrying claims (e.g. `{ sub: userId }`); the signature proves
  it wasn't tampered with. An *access token* is short-lived and sent on every request. A *refresh token*
  is long-lived and used only to get a new access token.

  ````ts
  // Why two tokens? Access is short-lived so a leaked one expires fast; refresh is long-lived so users
  // don't re-login constantly — but it's used rarely (only at /auth/refresh), shrinking its exposure.
  const [accessToken, refreshToken] = await Promise.all([
    jwt.signAsync(payload, { secret: cfg.accessSecret,  expiresIn: cfg.accessTtl }),   // ~15m
    jwt.signAsync(payload, { secret: cfg.refreshSecret, expiresIn: cfg.refreshTtl }),  // ~7d, DIFFERENT secret
  ])
  ````

  The two-token split balances **security vs. convenience**: a stolen *access* token is useless in
  minutes; the *refresh* token lasts a week but is only ever sent to one endpoint, so it's exposed far
  less. Signing them with **different secrets** means compromising the access secret can't mint refresh
  tokens (and lets you rotate one without invalidating the other).

  **Where else you'd use it:** almost every stateless API auth system uses short access + long refresh.
  The "separate keys per purpose" idea generalizes to signing vs. encryption keys, per-service secrets,
  etc.

  **Rule of thumb:** short-lived access + longer-lived refresh, signed with separate secrets. Keep the
  long-lived credential's *exposure surface* small (one endpoint), not just its lifetime.

### HTTP-only cookies for token storage (not bearer headers / localStorage)
- **What:** Tokens live in `access_token`/`refresh_token` HTTP-only cookies; custom `cookieExtractor`s feed both Passport strategies. Cookies: `httpOnly`, `sameSite: "lax"`, `secure` in production, `maxAge` = each JWT's TTL.
- **Where:** `jwt.strategy.ts:11-13`, `jwt-refresh.strategy.ts:10-12`, `auth.cookies.ts`, `auth.controller.ts:38-40`.
- **Why:** Keeps tokens out of JS-reachable storage (XSS can't read them); `sameSite: lax` mitigates CSRF; `secure` off in dev keeps localhost working.
- **Learn**

  **Vocabulary:** *XSS* (cross-site scripting) = attacker runs JS in your page. *CSRF* (cross-site request
  forgery) = another site tricks the browser into sending a request with your cookies. *HTTP-only cookie*
  = a cookie JavaScript **cannot** read.

  ````ts
  // ❌ token in localStorage — any XSS (a bad dependency, an injected script) can read and exfiltrate it
  localStorage.setItem("token", accessToken)         // JS-readable = XSS-stealable

  // ✅ token in an HTTP-only cookie — JS can't touch it; the browser attaches it automatically
  res.cookie("access_token", token, {
    httpOnly: true,                 // invisible to document.cookie / any script  → defeats XSS token theft
    sameSite: "lax",                // not sent on cross-site POSTs                → mitigates CSRF
    secure: nodeEnv === "production", // HTTPS-only in prod; off on localhost
    maxAge: FIFTEEN_MIN,
  })
  // frontend axios uses withCredentials:true; the cookie rides along — no bearer header, no JS token
  ````

  This is one of the highest-value security decisions in a web app. `localStorage`/bearer tokens are
  readable by any script, so a single XSS steals the session. An **HTTP-only** cookie is unreadable by JS,
  so even injected script can't exfiltrate it. `sameSite: lax` stops the classic CSRF vector; `secure`
  keeps it off plaintext HTTP in production.

  **Where else you'd use it:** any browser-based session/auth. (Native mobile apps, which have no cookie
  jar/XSS surface, typically do use bearer tokens in secure storage — context matters.)

  **Rule of thumb:** in the browser, store session tokens in `httpOnly` + `sameSite` + `secure` cookies,
  never `localStorage`. If JavaScript can read your token, so can an attacker's.

### `SameSite` is environment-driven: `None` cross-site in prod, `Lax` locally
- **What:** Cookie `sameSite` is computed, not fixed: `secure ? "none" : "lax"`. In production (HTTPS, `secure=true`) cookies are `SameSite=None; Secure` so they survive the frontend (Vercel) and API (Render) being on **different domains**; locally (`http`, `secure=false`) they stay `Lax`. `clearCookie` sends the same attributes so logout actually removes them.
- **Where:** `backend/src/modules/auth/auth.cookies.ts` (`baseOptions`, `clearAuthCookies`), `auth.controller.ts` (passes `this.secure`).
- **Why:** With a split deploy the browser treats every API call as cross-site; a `Lax` cookie is **not sent** cross-site, so login would succeed then every following request 401s. `None` (which the browser only accepts *with* `Secure`) is required. Kept `Lax` locally because localhost is same-site and often plain HTTP (where `None` would be rejected).
- **Learn**

  **Vocabulary:** *same-site* = same registrable domain. *`SameSite=Lax`* = cookie sent on top-level navigations but **not** on cross-site sub-requests (fetch/XHR to another domain). *`SameSite=None`* = sent on all cross-site requests, but the browser **requires `Secure`** (HTTPS) with it.

  ````ts
  // ❌ hard-coded Lax — works locally, silently breaks a split deploy:
  //    api.onrender.com is cross-site to app.vercel.app, so the browser never sends this cookie →
  //    login sets it, the very next axios call has no cookie → 401 everywhere.
  sameSite: "lax"

  // ✅ environment-driven: cross-site None+Secure in prod, Lax on localhost
  function baseOptions(secure: boolean) {
    return { httpOnly: true, secure, sameSite: (secure ? "none" : "lax") as "none" | "lax", path: "/" }
  }
  // clearCookie must send the SAME secure/sameSite or the browser won't match & delete the cookie.
  ````

  Cookie delivery depends on the relationship between the site setting the cookie and the site the
  request goes to. A frontend and API on **different domains** = cross-site, so only `SameSite=None`
  cookies ride along — and browsers accept `None` **only** over HTTPS (`Secure`). Tying `sameSite` to the
  same `secure` flag that's already `true` only in production gives the right value in each environment
  without a separate config knob.

  **Where else you'd use it:** any split-origin browser auth — SPA on a CDN + API on another host, a
  widget embedded on third-party sites, subdomains that aren't the same registrable domain. Keep `Lax`
  (the safer CSRF default) whenever the frontend and API **are** same-site.

  **Rule of thumb:** cookie auth across different domains needs `SameSite=None; Secure`; same-site can
  stay `Lax`. Drive it off your `secure`/prod flag, and clear cookies with the same attributes you set.

### Refresh = full rotation; logout invalidates; SHA-256-before-bcrypt
- **What:** Every refresh compares the presented token against the stored `bcrypt(sha256(token))` hash and issues/persists a brand-new pair; logout nulls `hashedRefreshToken`. Passwords: bcryptjs 12 rounds, capped `@MaxLength(72)`. Failures return generic `ForbiddenException`/`UnauthorizedException`.
- **Where:** `auth.service.ts:18,56-78,109-111`, `users.service.ts:11`, `register.dto.ts:9-13`.
- **Why:** Rotation limits the blast radius of a stolen refresh token; hashing-at-rest means a DB leak doesn't expose usable tokens; the SHA-256 pre-hash dodges bcrypt's 72-byte truncation.
- **Learn**

  **Vocabulary:** *hashing at rest* = store a one-way hash, not the secret itself, so a DB dump isn't
  directly usable. *Rotation* = issue a new token each time and invalidate the old one.

  ````ts
  // ❌ bcrypt-ing a long JWT directly: bcrypt reads only the first 72 BYTES and silently ignores the
  //    rest — two different refresh tokens sharing a 72-byte prefix hash identically.
  const hashed = await bcrypt.hash(refreshToken, 12)   // refreshToken is ~200+ chars

  // ✅ SHA-256 first (fixed 64-hex chars, whole token counts), THEN bcrypt that
  private digest(t: string) { return createHash("sha256").update(t).digest("hex") }
  const hashed = await bcrypt.hash(this.digest(refreshToken), 12)          // store this
  const ok = await bcrypt.compare(this.digest(presentedToken), user.hashedRefreshToken)  // verify
  // rotation: every refresh issues a NEW pair and overwrites the stored hash; logout sets it to null.
  ````

  Three ideas layered: (1) **store hashes, not tokens** — a leaked DB then holds useless hashes, not live
  sessions. (2) **rotate** — each refresh invalidates the last, so a stolen refresh token works at most
  until the real user next refreshes (which then locks the thief out). (3) the **bcrypt 72-byte gotcha**:
  bcrypt truncates input at 72 bytes with no error — fine for passwords (hence the `@MaxLength(72)` cap),
  dangerous for long JWTs — so SHA-256 collapses the token to a fixed length first. (Why not SHA-256
  alone? It's too fast to resist brute force; bcrypt's deliberate slowness still does the real work.)

  **Where else you'd use it:** hash *any* secret at rest — passwords, refresh tokens, API keys, reset
  tokens. Rotate long-lived credentials. Pre-hash anything longer than ~72 bytes before bcrypt.

  **Rule of thumb:** never store a secret in plaintext — hash it. Rotate long-lived tokens. Pre-hash long
  inputs (SHA-256) before bcrypt, and cap password length at 72.

### Two Passport-JWT strategies
- **What:** `jwt` (access) and `jwt-refresh` (with `passReqToCallback: true` to read the raw refresh token); both `ignoreExpiration: false`.
- **Where:** `jwt.strategy.ts`, `jwt-refresh.strategy.ts`.
- **Why:** The refresh route needs the raw token to compare against the stored hash — a normal access strategy can't see it.
- **Learn**

  ````ts
  // Two strategies = two verification rules. The access strategy just validates the token.
  // The refresh strategy ALSO hands the raw token to the service so it can compare against the stored hash.
  super({ jwtFromRequest: cookieExtractor("refresh_token"), secretOrKey: refreshSecret,
          ignoreExpiration: false, passReqToCallback: true })   // ← passReqToCallback gives us req → raw token
  ````

  Passport **strategies** are named, reusable auth rules. Splitting access vs. refresh keeps each rule
  focused: access verifies the short token on every request; refresh additionally needs the raw token
  value (to check it against the DB hash), which `passReqToCallback: true` exposes. `ignoreExpiration:
  false` ensures expired tokens are actually rejected (an easy footgun to get backwards).

  **Where else you'd use it:** separate strategies for API-key auth, OAuth providers, or an admin vs.
  user token — one named strategy per distinct verification rule, selected per route by a guard.

  **Rule of thumb:** one strategy per distinct auth rule; name them and apply per route. Double-check
  `ignoreExpiration` is `false` — silently accepting expired tokens is a classic mistake.

## Authorization

### Secure-by-default: global JwtAuthGuard + `@Public()` opt-out
- **What:** `JwtAuthGuard` is a global `APP_GUARD`, so **every** route requires a valid access JWT unless marked `@Public()` (read via `Reflector`). Only register/login/refresh and health are public.
- **Where:** `app.module.ts:38-41`, `common/guards/jwt-auth.guard.ts:16-25`, `common/decorators/public.decorator.ts`; usage `auth.controller.ts:42,54,66`.
- **Why:** Fails **closed** — forgetting a guard leaves a route protected, not open (the opposite of per-controller `@UseGuards`).
- **Learn**

  ````ts
  // ❌ opt-IN security: each route must remember @UseGuards. Forget it on ONE new controller → that
  //    endpoint is silently public. Fails OPEN.
  @UseGuards(JwtAuthGuard) @Get("recipes") list() { /* … */ }

  // ✅ register the guard globally → every route protected by default…
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }]
  // …and opt OUT explicitly with a tiny metadata decorator the guard checks
  @Injectable() export class JwtAuthGuard extends AuthGuard("jwt") {
    canActivate(ctx) {
      if (this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()])) return true
      return super.canActivate(ctx)     // everything not @Public() → require a valid JWT
    }
  }
  @Public() @Post("login") login() { /* … */ }   // the few genuinely-public routes say so
  ````

  The **direction of the default** is the whole lesson. Per-route `@UseGuards` makes security opt-in — a
  forgotten decorator is an exposed endpoint (fails **open**). A global guard inverts it: auth is the
  default, and you must *deliberately* mark a route `@Public()` (fails **closed**). A mistake now
  downgrades to "too locked down" (annoying), never "wide open" (a breach).

  **Where else you'd use it:** default-deny firewall rules, deny-all-then-allow CORS, feature flags off by
  default, permission systems. Any security control: make the safe state the default, require explicit
  opt-out.

  **Rule of thumb:** make the safe thing the default and require a visible, explicit opt-out for
  exceptions. Security should fail closed.

### `@CurrentUser()` — userId always from the verified JWT (anti-IDOR)
- **What:** A param decorator pulls the user (e.g. `@CurrentUser("id") userId`) off the request; userId comes from the verified token, never client input. Authorization is per-row ownership scoping (`where: { id, userId }`), no RBAC.
- **Where:** `common/decorators/current-user.decorator.ts:8-13`; ownership scoping throughout services.
- **Why:** Prevents IDOR — a client can never pass someone else's userId; the server derives it from the token and scopes every row query to it.
- **Learn**

  **Vocabulary:** *IDOR* (Insecure Direct Object Reference) = the server trusts a client-supplied
  identifier and returns whatever it points to, without checking ownership — one of the most common real
  API bugs.

  ````ts
  // ❌ trust a client-supplied userId → change ?userId=... and read someone else's data
  @Get("recipes") list(@Query("userId") userId: string) { return this.recipes.list(userId) }

  // ✅ identity comes from the VERIFIED JWT (set by the passport strategy), not the request
  export const CurrentUser = createParamDecorator((field, ctx) => {
    const user = ctx.switchToHttp().getRequest().user   // populated only from the validated token
    return field ? user[field] : user
  })
  @Get("recipes") list(@CurrentUser("id") userId: string) { return this.recipes.list(userId) }
  // …and every query is still scoped by owner as defense-in-depth:  where: { userId }
  ````

  The fix for IDOR is to **never take identity from the request**. `@CurrentUser` reads `req.user`, which
  only the JWT strategy sets after verifying the signature — so a client physically cannot claim another
  user's id. Scoping every query with `where: { userId }` is the second layer (defense-in-depth).

  **Where else you'd use it:** every endpoint that returns or mutates user-owned data. Treat any
  `userId`/`accountId`/`orgId` arriving in a request body/query/param as a red flag.

  **Rule of thumb:** identity comes from the token, never from client-controlled input. Scope every
  owned-resource query by the authenticated user.

### Refresh guard scoped to one route
- **What:** `@UseGuards(JwtRefreshGuard)` only on `POST /auth/refresh`.
- **Where:** `auth.controller.ts:70`.
- **Why:** The refresh strategy validates nothing but the refresh endpoint. *(Small — the one place a route-level guard overrides the global default; no deeper lesson beyond "apply the right guard to the right route.")*

## Input Validation & Hardening

### Global ValidationPipe (whitelist + transform)
- **What:** `ValidationPipe({ whitelist: true, transform: true })` app-wide (details in [backend.md](./backend.md)).
- **Where:** `main.ts:19`.
- **Why:** Strips unexpected properties and coerces DTOs everywhere. **Gotcha:** `forbidNonWhitelisted` not set → unknown fields silently dropped, not rejected.
- **Learn** — see the full `Learn` block in [backend.md](./backend.md) (validation-by-DTO). Security angle: `whitelist: true` is your defense against **mass-assignment / over-posting** — a client sending `{ …, role: "admin", isVerified: true }` has those extra fields stripped before they can reach a `create`/`update`. Rule of thumb: validate every input against an explicit allow-list of fields; never spread a raw request body into a DB write.

### helmet, cookie-parser, and credentialed CORS locked to one origin
- **What:** helmet + cookie-parser global; CORS restricted to configured `CORS_ORIGIN` (default `http://localhost:3000`) with `credentials: true`.
- **Where:** `main.ts:17-25`.
- **Why:** Security headers by default; `credentials: true` + a single fixed origin is required for cookie auth while not opening CORS to the world.
- **Learn**

  **Vocabulary:** *CORS* (Cross-Origin Resource Sharing) controls which other origins may call your API
  from a browser. *helmet* sets a bundle of protective HTTP headers.

  ````ts
  app.use(helmet())                                    // sane security headers (CSP, HSTS, no-sniff, …)
  app.enableCors({ origin: config.CORS_ORIGIN, credentials: true })
  //   origin: ONE fixed origin — NOT "*". With credentials:true the browser forbids "*" anyway.
  ````

  `credentials: true` is what lets the browser send the auth cookie cross-origin (frontend :3000 → API
  :3001) — but it **must** be paired with a specific `origin`, never `*` (the spec forbids wildcard +
  credentials, for good reason: it'd let any site make authenticated calls). helmet adds baseline
  hardening headers for free.

  **Where else you'd use it:** any browser-facing API with cookie auth — lock CORS to your known
  frontend origin(s). Add helmet (or your framework's equivalent) to every web service.

  **Rule of thumb:** with cookie auth, set CORS to your exact frontend origin + `credentials: true` —
  never `origin: "*"`. Ship security headers (helmet) by default.

### Rate limiting ahead of auth · Fail-fast secret validation · DB errors never leak
- **Rate limiting before auth** (`app.module.ts:27,38-41`) — throttles even unauthenticated login/refresh; the *ordering* lesson is in [backend.md](./backend.md).
- **Fail-fast secret validation** (`env.validation.ts`) — JWT secrets `@MinLength(16)`, required `DATABASE_URL`/`GEMINI_API_KEY`; app won't boot otherwise. Lesson in [backend.md](./backend.md).
- **DB errors never leak** (`prisma-exception.filter.ts`) — Prisma codes mapped to HTTP in the standard envelope; raw DB strings (which reveal schema/constraints) never reach the client. Lesson in [backend.md](./backend.md).

> **Noted exposure:** Swagger `/docs` is served without auth gating (`main.ts:29-41`). Fine for dev;
> revisit before a public deploy.

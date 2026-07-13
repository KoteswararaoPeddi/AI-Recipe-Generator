# Deployment — PantryChef

Three separate pieces, deployed in **dependency order**:

| Piece | Host | Notes |
| --- | --- | --- |
| Database (Postgres) | **Neon** | serverless Postgres; gives a **pooled** + a **direct** URL |
| Backend (NestJS) | **Render** / Railway / Fly.io | a real Node app host (Vercel can't run a long-lived Nest server) |
| Frontend (Next.js) | **Vercel** | its native use case |

> Vercel hosts **only** the frontend. The NestJS backend is a persistent Express server
> (`app.listen`, cookies, in-memory throttler, Passport) — it belongs on a Node app host.

---

## Order: Database → Backend → Frontend → (loop back for CORS)

### 1. Database — Neon
1. Create a Neon project.
2. Copy two connection strings (Neon dashboard → "Connection pooling" toggle):
   - **Pooled** (host has `-pooler`, PgBouncer) → for the app at runtime.
   - **Direct** (no `-pooler`) → for migrations.
   Both include `?sslmode=require`.
3. No deploy needed — the DB is live immediately.

**Why pooled + direct (not one URL):** zero-downtime deploys briefly run the old + new instance,
doubling DB connections; the pooler absorbs that so Neon's connection limit isn't exhausted. Prisma
**migrations** can't run through the pooler, so they use the direct URL via `directUrl` in
`prisma/schema.prisma`. (See `context/engineering/database.md`.)

### 2. Backend — Render (Web Service, Root Directory = `backend`)
- **Build:** `npm ci && npx prisma generate && npm run build && npx prisma migrate deploy`
  - `migrate deploy` applies committed migrations to Neon using `DIRECT_URL`. (Never `migrate dev` in prod.)
- **Start:** `node dist/main`
- **Env vars** (set in Render, never committed):
  ```
  DATABASE_URL   = <Neon POOLED url>     (…-pooler…?sslmode=require)
  DIRECT_URL     = <Neon DIRECT url>     (same, minus `-pooler`)
  JWT_ACCESS_SECRET  = <long random>
  JWT_REFRESH_SECRET = <different long random>
  GEMINI_API_KEY = <your key>
  NODE_ENV       = production            (→ Secure + SameSite=None cookies)
  CORS_ORIGIN    = http://localhost:3000 (placeholder; fixed in step 4)
  ```
- Verify: `https://<backend>/api/health` → `{"success":true,...,"db":"up"}`.

### 3. Frontend — Vercel (Root Directory = `frontend`)
- **Env var:** `NEXT_PUBLIC_API_URL = https://<backend-domain>/api`
- Deploy → note the URL, e.g. `https://<app>.vercel.app`.

### 4. Loop back — point the backend at the real frontend
- On Render, set `CORS_ORIGIN = https://<app>.vercel.app` → **redeploy backend**.

### 5. Verify end to end
Sign up → log in → refresh a protected page → generate a recipe. If login works but the next
request 401s, the cross-site cookie/CORS isn't right (needs `NODE_ENV=production` on the backend so
cookies are `SameSite=None; Secure`, and `CORS_ORIGIN` = the exact frontend origin).

---

## Local vs production
Same code, different env values. Keep them in separate `.env` files (both gitignored):

| | Local `.env` | Production (host env) |
| --- | --- | --- |
| `DATABASE_URL` | `…@localhost:5432/pantrychef` | Neon **pooled** |
| `DIRECT_URL` | **same as** `DATABASE_URL` (no pooler locally) | Neon **direct** |
| `NODE_ENV` | `development` (cookies `SameSite=Lax`) | `production` (`SameSite=None; Secure`) |
| `CORS_ORIGIN` | `http://localhost:3000` | `https://<app>.vercel.app` |

Migrations: develop with `npx prisma migrate dev` (local), commit `prisma/migrations/`, and Render
applies them to Neon via `npx prisma migrate deploy` on each build.

## Security
- Never commit real DB URLs / secrets — host env vars + gitignored `.env` only.
- If a connection string is ever exposed, rotate the Neon role password immediately.

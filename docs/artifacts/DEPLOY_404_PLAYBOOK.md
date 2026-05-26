# Storefront smoke 404 / DEPLOYMENT_NOT_FOUND — playbook

## Symptom matrix

| HTTP body / status | Meaning | Fix |
|------------------|---------|-----|
| `DEPLOYMENT_NOT_FOUND` | Vercel URL is **wrong or deleted** | Copy fresh URL from Vercel → Deployments |
| `404` + Next.js page | App live, slug **not published** | Admin → Launch → Published ON for `hello` |
| `404` on localhost | Dev server down or slug missing | `npm run dev:safe`, publish slug |
| All smoke checks 404 | Almost always **bad base URL** | `npm run storefront:diagnose-deploy` |

Your current default hosts (`xn---production-…`, `xn---preview--staging-…`) return **DEPLOYMENT_NOT_FOUND** — update them.

---

## Step 1 — Get real Vercel URL

1. [Vercel Dashboard](https://vercel.com) → KitchenOS project  
2. **Deployments** → latest **Production** → copy domain (e.g. `kitchenos-xxx.vercel.app`)  
3. Optional: **Preview** deployment URL for staging  

---

## Step 2 — Update local env

```bash
export STOREFRONT_KNOWN_PRODUCTION_URL="https://YOUR-REAL-PROD.vercel.app"
export STOREFRONT_KNOWN_STAGING_URL="https://YOUR-REAL-PREVIEW.vercel.app"
npm run storefront:apply-deploy-urls
npm run storefront:diagnose-deploy
```

**Pass:** diagnose shows `✓ … 200 — Storefront responds` on `/s/hello`.

---

## Step 3 — Vercel Production env

Upload from [`VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md`](VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md), especially:

- `DATABASE_URL` / `DIRECT_URL` (same as Supabase pooler)
- `NEXT_PUBLIC_APP_URL` = production domain
- All P0 keys → **Redeploy**

Without `DATABASE_URL` on Vercel, storefront routes may 404 or error.

---

## Step 4 — Publish pilot slug

```bash
npm run storefront:list-slugs
```

Or Admin → Storefront → store **hello** → **Published**.

---

## Step 5 — Re-run smoke

```bash
export STOREFRONT_SMOKE_BASE_URL="https://YOUR-REAL-PROD.vercel.app"
export STOREFRONT_SMOKE_SLUG=hello
export STOREFRONT_SMOKE_ENV=production
npm run storefront:post-deploy
```

---

## DATABASE_URL errors in terminal

### P1013 — invalid database string

Usually the **shell** still has a poisoned `DATABASE_URL` from `source .env.production.local` in zsh. Prisma CLI reads the bad shell value before `.env.local`.

**Do not run:**

```bash
npx prisma migrate dev    # may use poisoned shell env → P1013
set -a && source .env.production.local && set +a   # breaks URLs with ? & # in password
```

**Use:**

```bash
unset DATABASE_URL DIRECT_URL
npm run diagnose:prisma-env
npm run prisma:db:push:safe          # Phase 2 tables (pilot — no shadow DB)
# or
npm run prisma:migrate:safe -- --name storefront_phase2
```

### P3006 / shadow database

If `migrate dev` fails on old migrations, use `npm run prisma:db:push:safe` for pilot schema sync.

**Use for dev:**

```bash
npm run storefront:seed-week1-redirects
npm run storefront:week1-complete
```

Scripts load `.env.local` + `.env.production.local` via a safe parser.

---

## Redirect / Lighthouse failed with 404

Both depend on a **live** `/s/hello` (200). Fix deploy URL first, then:

```bash
npm run storefront:week1-complete
```

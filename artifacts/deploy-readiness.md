# KitchenOS — Full Deployment Readiness Check

**Date:** Fri May 29 18:48 EDT 2026  
**Node:** v22.22.3  
**Git:** `fd0d318f` chore: pre-Vercel deployment preparation  
**Target:** https://os-kitchen.com (Vercel)

---

## Summary

| # | Check | Result | Blocks deploy? |
|---|-------|--------|----------------|
| 1 | TypeScript (`typecheck:full`) | ✅ Exit 0 | — |
| 2 | Prisma validate + generate | ✅ Exit 0 (2 warnings) | — |
| 3 | `npm run build` | ✅ Exit 0 (~15 min, 16 GB heap) | — |
| 4 | `npm test` | ❌ 109 failed / 4973 tests | ⚠️ CI uses focused bundles; not Vercel build blocker |
| 5 | ESLint errors | ✅ 0 errors | — |
| 6 | Vercel configs | ✅ vercel.json + next.config.ts | — |
| 7 | Env vars catalog | ✅ 600+ keys referenced (see below) | Manual Vercel setup |
| 8 | Secrets in code | ✅ No live keys found | — |
| 9 | Large files (>5 MB) | ⚠️ tsbuildinfo cache files only | — |
| 10 | App structure | ✅ page, layout, middleware | — |

**Verdict:** Codebase is **build-ready**. Remaining work is **Vercel dashboard setup**, **production env vars**, and optional **test triage**.

---

## 1. TypeScript

```
> npm run typecheck:full
Exit: 0
```

No TypeScript errors.

---

## 2. Prisma

```
The schema at prisma/schema.prisma is valid 🚀
Validate exit: 0
Generate exit: 0
```

**Warnings (non-blocking):** 2× `onDelete: SetNull` on required relation fields — review before next migration.

---

## 3. Next.js build

```
○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand

Exit: 0
```

Build succeeded with `NODE_OPTIONS=--max-old-space-size=16384`.  
Previous `/dashboard/launch-wizard` TDZ error is **fixed** in commit `fd0d318f`.

> **Note:** Remote Vercel builders may OOM on default heap. Project uses `scripts/vercel-build.sh` (14 GB on `VERCEL=1`) or prebuilt deploy: `npm run deploy:prod`.

---

## 4. Tests

```
Test Files  77 failed | 1350 passed | 7 skipped (1434)
     Tests  109 failed | 4845 passed | 19 skipped (4973)
Duration  807s
Exit: 1
```

Failures are predominantly **era25 governance validate scripts timing out** (5000 ms default). CI runs focused bundles (`test:ci:governance-bundles`, etc.) instead of full suite.

---

## 5. Lint (errors only)

```
Error count: 0
```

Warnings only (unused vars in theme-experiment modules).

---

## 6. Vercel configs

| Item | Status |
|------|--------|
| `vercel.json` | ✅ EXISTS — framework nextjs, region iad1, 16 crons |
| `next.config.ts` | ✅ EXISTS — App Router, serverActions, CSP, image remotePatterns |
| `postinstall` | ✅ prisma generate + shims |
| `build` | ✅ prisma generate + next build |

**vercel.json buildCommand:** `bash scripts/vercel-build.sh`  
**installCommand:** `npm ci && npx prisma generate`

---

## 7. Production env vars (minimum)

Full list: `docs/ENVIRONMENT_VARIABLES.md` and `docs/vercel-env-vars.md`.

**Required for production launch:**

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://os-kitchen.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only |
| `DATABASE_URL` | Pooled Postgres (`:6543`) |
| `DIRECT_URL` | Direct/session Postgres |
| `ENCRYPTION_KEY` | `openssl rand -base64 32` |
| `CRON_SECRET` | Required for 16 cron jobs in vercel.json |
| `STOREFRONT_MIDDLEWARE_SECRET` | Vanity host resolution |
| `RATE_LIMIT_ADAPTER` + Upstash | `upstash` + `UPSTASH_REDIS_REST_*` for multi-instance |
| Stripe keys | When billing enabled |
| `NODE_OPTIONS` | `--max-old-space-size=14336` on Vercel (or use prebuilt) |

600+ optional env keys exist for experiments/integrations — not all needed at launch.

---

## 8. Secrets scan

```
grep sk- in app/lib/services: no live Stripe keys (false positives: task-priority paths)
grep sk_live/sk_test patterns: only redaction tests and stripe-readiness checks
```

`.env*` files contain `DATABASE_URL` placeholders locally — **not committed** (in .gitignore).

---

## 9. Large files (>5 MB, excl. node_modules/.git/.next)

```
./tsconfig.typecheck.tsbuildinfo
./tsconfig.tsbuildinfo
./.tsbuildinfo.slice.*
```

Build cache artifacts — safe to delete locally; consider ensuring `*.tsbuildinfo` in `.gitignore`.

---

## 10. App structure

```
app/page.tsx      ✅
app/layout.tsx    ✅
middleware.ts     ✅
```

---

## Что осталось доделать

### Обязательно перед go-live

1. **Vercel Dashboard → Environment Variables** — set production vars per `docs/vercel-env-vars.md`
2. **Vercel → Domains** — attach `os-kitchen.com`, update DNS
3. **Supabase** — production `DATABASE_URL` / `DIRECT_URL`, auth redirect URLs
4. **`CRON_SECRET`** — generate and set (16 cron routes in vercel.json)
5. **Deploy method** — prefer `npm run deploy:prod` (prebuilt) over raw Git push if remote build OOMs
6. **Post-deploy** — verify `https://os-kitchen.com/api/health`

### Рекомендуется

7. **Stripe webhooks** — point to `https://os-kitchen.com/api/webhooks/stripe`
8. **`ENCRYPTION_KEY`** — must exist before saving integration secrets
9. **`LEGAL_POLICIES_PUBLISHED=true`** — only after counsel-approved legal pages
10. **Prisma migrate** — run `npm run db:deploy` against production before/at deploy

### Не блокирует деплой

11. **109 failing unit tests** — era25 validate timeouts; triage separately
12. **Prisma SetNull warnings** — schema hygiene for future migration
13. **tsbuildinfo files** — local cache cleanup

---

## Deploy commands

```bash
# Recommended (prebuilt — avoids Vercel OOM)
npm run deploy:prod

# Or push to main if Vercel Git integration + env vars configured
git push origin main
```

---

*Generated by FULL DEPLOYMENT READINESS CHECK — read-only diagnostic.*

# Storefront preflight — 2026-05-17T12:57:29Z

## KitchenOS Storefront production preflight

- Loaded `.env.production.local`

### 1. Cron profile
- `vercel.json` crons: **7** (production target: **6**)

### 2. Storefront env

> kitchenos@0.1.0 check-env:storefront:report
> tsx scripts/check-env-storefront.ts --report

KitchenOS — storefront env check (secrets not logged)

Loaded: .env, .env.local, .env.production.local

✓ [critical] DATABASE_URL — Set
✓ [warning] DIRECT_URL — Set (migrations)
✗ [critical] NEXT_PUBLIC_APP_URL — Use https:// for production (not http://localhost)
✓ [critical] STOREFRONT_MIDDLEWARE_SECRET — ≥32 chars
✓ [critical] CRON_SECRET — Set
✓ [critical] AUTH_SECRET / NEXTAUTH_SECRET — Set
✓ [warning] Supabase public keys — Set
⚠ [info] Turnstile (checkout + contact) — Optional — rate limits still apply; set keys for prod hardening
✓ [info] STOREFRONT_REDIRECTS_ENABLED — true — middleware uses redirect table
✓ [info] Storefront media bucket — Storage provider configured
✓ [warning] Preview signing — STOREFRONT_PREVIEW_SECRET or AUTH_SECRET usable

✗ 1 critical check(s) failed

Report: /Users/dmytro/Desktop/2026/KitchenOS/docs/artifacts/storefront-env-report-latest.md
- Env: **FAIL**

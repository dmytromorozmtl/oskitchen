# KDS staging smoke checklist

Status: canonical operational smoke for KDS v1 daily-service tickets  
Policy: `lib/kitchen/kds-staging-smoke-policy.ts` (`era4-kds-staging-smoke-v1`); realtime/poll: `lib/kitchen/kds-realtime-smoke-policy.ts` (`era6-kds-realtime-smoke-v1`); Realtime Playwright E2E: `lib/kitchen/kds-realtime-e2e-staging-policy.ts` (`era8-kds-realtime-e2e-staging-v1`, **staging-only**, **not in default CI**)  
Scope boundary: `docs/kds-v1-scope.md`

## What this proves

One **qualified** operational path: today's active order appears on the daily KDS queue, bump moves it to `READY`, recall returns it to `PREPARING` (when exercised). Suitable for staging pilots and pre-release kitchen ops sign-off.

## What this does not prove

- Rush-hour or multi-station kitchen load
- Supabase Realtime reliability under production traffic (poll fallback exists; verify manually)
- Playwright Realtime E2E in default CI (no KDS Playwright spec in repo at Era 8 Cycle 2)
- Hardware bump bars or kitchen printers
- Production-board / `ProductionWorkItem` workflows (adjacent, not v1-certified here)

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| Tenant operating mode | `DAILY_SERVICE` (`isDailyServiceMode`) |
| Permissions | Actor with `kitchen.view`, `kitchen.bump`, `kitchen.recall` |
| Non-production gate | `ENABLE_KDS_V1_CERTIFIED=true` when `NODE_ENV` is not `production` |
| Staging data | At least one `PREPARING` order for today on the unified order spine |

## Tier A — Automated CI (no browser)

Run locally or rely on CI `quality` job governance bundles:

```bash
npm run test:ci:kds-v1:unit
export DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/kitchenos
export DIRECT_URL="$DATABASE_URL"
export RUN_DB_INTEGRATION=1
npx prisma db push
npm run test:ci:kds-v1:integration
npm run test:ci:kds-staging-smoke
npm run test:ci:kds-staging-smoke:cert
npm run test:ci:kds-realtime-smoke
npm run test:ci:kds-realtime-smoke:cert
```

## Tier D — Realtime verification (staging, manual)

Policy `era6-kds-realtime-smoke-v1` certifies **poll fallback (15s)** and **channel naming** in unit tests — not production Realtime load.

1. Open kitchen KDS (`/dashboard/kitchen` or fullscreen/tablet).
2. Note status line: **○ Polling fallback (15s)** or **● Live (Supabase Realtime)**.
3. With Realtime disconnected (or blocked), create a new `PREPARING` order — ticket should appear within **≤15s**.
4. With Realtime connected, confirm status shows **Live**; optional: verify faster refresh on order change (manual).
5. Record: Realtime observed? Poll-only? Any missed tickets?

Do **not** use this tier to claim rush-hour, Playwright E2E, or production-traffic Realtime certification.

## Tier E — Realtime Playwright E2E (staging-only, not in default CI)

Policy `era8-kds-realtime-e2e-staging-v1` — **no Playwright KDS spec ships yet**. Use Tier D manual observation until `e2e/kds-realtime-*.spec.ts` exists.

When a spec is added, run **only on staging** with:

| Variable | Purpose |
|----------|---------|
| `PLAYWRIGHT_BASE_URL` | Staging or preview host |
| `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD` | Dashboard kitchen actor |
| `ENABLE_KDS_V1_CERTIFIED=true` | Non-production KDS gate |
| `NEXT_PUBLIC_SUPABASE_*` | Realtime client |

```bash
# Future (when spec exists) — example only:
# ENABLE_KDS_V1_CERTIFIED=1 PLAYWRIGHT_BASE_URL=https://staging.example.com \
#   E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... \
#   npx playwright test e2e/kds-realtime-kitchen.spec.ts --project=chromium-authed
```

Certification gate: `npm run test:ci:kds-realtime-e2e-staging:cert` (policy wiring — not a browser run).

Do **not** add this tier to default GitHub Actions CI without an explicit era decision.

## Tier B — Staging DB smoke script (optional)

Exercises queue load → ticket visible → bump → recall on a disposable or owner-scoped order:

```bash
export DATABASE_URL=postgresql://...   # staging or local
npx tsx scripts/smoke-kds-daily-service.ts --help
npx tsx scripts/smoke-kds-daily-service.ts --ephemeral
# or against an existing owner:
npx tsx scripts/smoke-kds-daily-service.ts --owner-email ops@example.com
```

## Tier C — Manual UI smoke (staging)

1. Sign in as kitchen lead or owner with `kitchen.view`.
2. Open `/dashboard/kitchen`, `/dashboard/kitchen?fullscreen=1`, or `/dashboard/kitchen/tablet`.
3. Confirm a `PREPARING` ticket shows customer name, line items, elapsed timer.
4. Tap **Bump** — ticket moves to ready/complete state; order status `READY` in order hub.
5. Tap **Recall** on a ready ticket — returns to `PREPARING`.
6. Create a new POS or manual order in `PREPARING` — ticket appears within poll window (≤15s without Realtime, faster with Realtime).
7. If allergen conflict data exists, confirm conflict badge is visible (see v1 scope).

Record result: **PASS** / **FAIL** with date, environment URL, operator, and order id sample.

## Sign-off template

| Field | Value |
|-------|-------|
| Environment | staging URL |
| Date | YYYY-MM-DD |
| Operator | name |
| Tier A CI | pass/fail |
| Tier B DB smoke | pass/skip/fail |
| Tier C UI | pass/fail |
| Tier D Realtime | pass/skip/fail |
| Notes | Realtime observed? Poll-only? Any permission denials? |

Do **not** use this checklist to claim rush-hour or restaurant-grade KDS certification.

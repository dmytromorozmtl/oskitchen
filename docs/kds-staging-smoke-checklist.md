# KDS staging smoke checklist

Status: canonical operational smoke for KDS v1 daily-service tickets  
Policy: `lib/kitchen/kds-staging-smoke-policy.ts` (`era4-kds-staging-smoke-v1`); Era 10 recert: `era10-kds-staging-smoke-recert-v1`; Era 15 recert: `era15-kds-staging-smoke-recert-v1` (`lib/kitchen/kds-staging-smoke-era15-policy.ts`); **Era 16 operational sign-off:** `era16-operational-signoff-v1` (`lib/operations/operational-signoff-summary.ts`, `npm run smoke:operational-signoff-era16`); **Era 17 Playwright proof:** `era17-kds-staging-playwright-proof-v1` (`npm run smoke:kds-staging-playwright`); **Era 17 sales one-pager:** `era17-kds-qualified-sales-onepager-v1` (`docs/kds-qualified-sales-onepager-era17.md`); `npm run smoke:kds-staging`; realtime/poll: `era6-kds-realtime-smoke-v1`; Realtime Playwright E2E: `era8-kds-realtime-e2e-staging-v1` + `era11-kds-realtime-e2e-staging-v1` (**staging-only**, **not in default CI**); workflow secrets: `era13-kds-staging-workflow-secrets-align-v1`  
Scope boundary: `docs/kds-v1-scope.md`

## What this proves

One **qualified** operational path: today's active order appears on the daily KDS queue, bump moves it to `READY`, **recall_to_preparing** returns it to `PREPARING`. **Era 10:** CI integration recertifies bump + recall (`tests/integration/kds-daily-queue-bump.integration.test.ts`). **Era 15:** `npm run smoke:kds-staging` chains unit + integration + optional realtime E2E cert wiring. Suitable for staging pilots and pre-release kitchen ops sign-off.

## What this does not prove

- Rush-hour or multi-station kitchen load
- Supabase Realtime reliability under production traffic (poll fallback exists; verify manually)
- Playwright Realtime E2E in default CI (spec exists at Era 11 — staging-only with explicit skip summary)
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

Policy `era8-kds-realtime-e2e-staging-v1` + Era 11 extension `era11-kds-realtime-e2e-staging-v1` — Playwright spec **`e2e/kds-realtime-staging.spec.ts`** (staging-only; **not in default CI**). Explicit skip artifact: `kds-realtime-e2e-staging-summary` via `npm run test:ci:kds-realtime-e2e-staging:policy` reports **PASSED** / **SKIPPED** / **FAILED** (never silent pass).

Run **only on staging** with:

| Variable | Purpose |
|----------|---------|
| `PLAYWRIGHT_BASE_URL` | Staging or preview host |
| `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD` | Dashboard kitchen actor |
| `ENABLE_KDS_V1_CERTIFIED=true` | Non-production KDS gate |
| `NEXT_PUBLIC_SUPABASE_*` | Realtime client |

```bash
export ENABLE_KDS_V1_CERTIFIED=true
export PLAYWRIGHT_BASE_URL=https://staging.example.com
export E2E_LOGIN_EMAIL=...
export E2E_LOGIN_PASSWORD=...
npm run build && npm run start -- -p 3000 &
npm run test:ci:kds-realtime-e2e-staging:playwright
KDS_REALTIME_E2E_STEP_OUTCOME=success npm run test:ci:kds-realtime-e2e-staging:policy
```

Certification gate: `npm run test:ci:kds-realtime-e2e-staging:cert` (policy wiring + era11 recert — not a browser run in default CI).

**Optional GitHub Actions workflow (Era 11 + Era 13/15 staging ops):** `.github/workflows/playwright-kds-staging.yml` (`era11-kds-realtime-e2e-staging-workflow-v1`, `era13-kds-staging-workflow-secrets-align-v1`, `era13-staging-workflows-first-run-ops-v1`, `era15-staging-workflows-first-run-recert-v1`) — `workflow_dispatch` or weekly schedule when `E2E_STAGING_BASE_URL` + `E2E_LOGIN_EMAIL` + (`E2E_LOGIN_PASSWORD` or legacy `E2E_PASSWORD`) are set; job omitted when secrets missing (`JOB_OMITTED_SECRETS_MISSING`); uploads `kds-realtime-e2e-staging-summary` artifact (`PASSED` / `FAILED` / `SKIPPED WITH REASON`). First-run checklist: `docs/GITHUB_E2E_STAGING_SECRETS.md`; `npm run smoke:staging-workflows`.

Do **not** add this tier to default GitHub Actions `ci.yml` quality job.

## Era 17 — Playwright GitHub proof (Workstream F Cycle 25)

**Policy:** `era17-kds-staging-playwright-proof-v1` — **awaiting_github_kds_playwright_pass**; records GitHub PASS for `playwright-kds-staging.yml`.

1. Run **`npm run smoke:kds-staging-playwright`** after configuring staging secrets.
2. Review **`artifacts/kds-staging-playwright-proof-summary.json`** — `playwrightProofStatus`.
3. Requires `GITHUB_KDS_STAGING_RUN_URL` + `GITHUB_KDS_STAGING_RUN_OUTCOME=PASSED` after `workflow_dispatch` — wiring cert alone is insufficient.
4. **Do not claim rush-hour KDS or default-CI Playwright certification.**

**Execution status (2026-05-28):** local smoke → wiring cert **PASSED**; Playwright proof **SKIPPED WITH REASON** (`playwrightProofStatus: proof_skipped_missing_prerequisites`). Missing: `E2E_STAGING_BASE_URL`, `E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD`, `GITHUB_KDS_STAGING_RUN_URL`, `GITHUB_KDS_STAGING_RUN_OUTCOME`.

## Era 17 — operational sign-off staging proof (Workstream F Cycle 26)

**Policy:** `era17-operational-signoff-staging-proof-v1` — **awaiting_staging_operator_signoff**; unified KDS + production calendar staging sign-off with operator URL.

1. Set `OPERATIONAL_SIGNOFF_STAGING_URL` + `OPERATIONAL_SIGNOFF_OPERATOR_EMAIL`.
2. Run **`npm run smoke:operational-signoff-staging`** — review **`artifacts/operational-signoff-staging-proof-summary.json`**.
3. Complete Tier C manual UI smoke on staging; attestation via `OPERATIONAL_SIGNOFF_KDS_MANUAL=passed`.

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

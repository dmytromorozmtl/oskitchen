# E2E — Paid pilot journey

End-to-end validation of the **paid pilot** operational path on **staging** (not production partner credentials).

## What it covers

| Step | Route | Assertion |
|------|--------|-----------|
| Auth | `/login` | Owner (and optional staff) session via setup projects |
| Today | `/dashboard` | “Today in …” heading |
| Orders | `/dashboard/orders` | List + “New order”, no RBAC wall |
| Order hub | `/dashboard/order-hub` | Heading visible |
| Production | `/dashboard/production` | Business-type production title |
| Packing | `/dashboard/packing` | Packing / loadout title |
| Channels | `/dashboard/sales-channels` | Workspace metrics cards |
| Import | `/dashboard/import-center` | Data Import Center |
| Quick order | `/dashboard/orders/quick` | Surface loads |
| Staff (optional) | orders + order hub | Same workspace visibility |
| Staff guard | `/platform` | Must not land on platform home |

## Prerequisites (staging DB)

1. `prisma migrate deploy` on staging.
2. `npm run workspace:backfill:phase1` (and phase2 when signed off) — see `docs/WORKSPACE_MIGRATION_RUNBOOK_STAGING.md`.
3. Dedicated **pilot fixture workspace** (owner + optional staff member in the same workspace).
4. `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot` on the target deployment (recommended).

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `PLAYWRIGHT_BASE_URL` | Yes | Staging URL (e.g. `https://staging.kitchenos.app`) |
| `E2E_PILOT_EMAIL` | Yes | Pilot owner login |
| `E2E_PILOT_PASSWORD` | Yes | Pilot owner password |
| `E2E_PILOT_STAFF_EMAIL` | No | Staff member in same workspace |
| `E2E_PILOT_STAFF_PASSWORD` | No | Staff password |

Load from `.env.local` via `e2e/load-playwright-env.ts` when running locally.

## Local run

```bash
export PLAYWRIGHT_BASE_URL=https://your-staging.example.com
export E2E_PILOT_EMAIL=owner@pilot.example.com
export E2E_PILOT_PASSWORD='...'
# optional staff:
export E2E_PILOT_STAFF_EMAIL=staff@pilot.example.com
export E2E_PILOT_STAFF_PASSWORD='...'

npm run test:e2e:pilot
```

Auth state is written to `e2e/.auth/pilot-owner.json` (and `pilot-staff.json` when staff vars are set).

## CI

Workflow: **`.github/workflows/e2e-pilot.yml`** (daily + `workflow_dispatch`).

GitHub **secrets** (repository or `staging-e2e` environment):

| Secret | Maps to |
|--------|---------|
| `E2E_STAGING_BASE_URL` | `PLAYWRIGHT_BASE_URL` |
| `E2E_PILOT_EMAIL` | owner email |
| `E2E_PILOT_PASSWORD` | owner password |
| `E2E_PILOT_STAFF_EMAIL` | optional staff |
| `E2E_PILOT_STAFF_PASSWORD` | optional staff |

The job is **skipped** when owner secrets are missing (no false green).

## Playwright projects

| Project | Setup | Specs |
|---------|--------|-------|
| `pilot-journey` | `e2e/pilot-auth.setup.ts` | `tests/e2e/pilot-journey.spec.ts` |
| `pilot-staff` | `e2e/pilot-staff-auth.setup.ts` | `tests/e2e/pilot-journey-staff.spec.ts` |
| `ci-critical-paths` | — | Public specs only (`pilot-journey*.spec.ts` excluded) |

## Out of scope (future)

- Full signup → onboarding → first menu (needs disposable email + DB seed)
- Shopify/Woo live webhook replay (sandbox fixtures)
- POS checkout with hardware register seed (`db:seed:e2e-pos`)
- Storefront Stripe live checkout

See `docs/TESTING.md` and `docs/E2E_CI_CRITICAL_PATHS_PLAN.md` for adjacent suites.

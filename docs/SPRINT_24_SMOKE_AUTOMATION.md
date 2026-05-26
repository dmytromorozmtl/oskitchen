# Sprint 24 — automated post-NOT NULL smoke

**Status:** ✅ complete (2026-05-24)

## Commands

| Command | Purpose |
|---------|---------|
| `npm run smoke:workspace-post-not-null` | Full gate: unit, scope audit, DB strict, staff verify, reconcile dry-run, public E2E |
| `npm run test:e2e:workspace-smoke` | Playwright: Today, Orders, Menus, POS, Storefront |
| `npm run workspace:reconcile:duplicates` | Dry-run duplicate owner workspaces |
| `npm run workspace:reconcile:duplicates:execute` | Merge + delete duplicate workspaces |

## Environment

| Variable | Required for |
|----------|----------------|
| `DATABASE_URL` | `workspace:strict:all`, reconcile |
| `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD` | Authenticated Playwright smoke |
| `E2E_STAFF_EMAIL` / `E2E_STAFF_PASSWORD` | Staff visibility tests |
| `E2E_STOREFRONT_SLUG` | Storefront slug (default: `demo`) |
| `PLAYWRIGHT_BASE_URL` | Target app (default: `http://127.0.0.1:3000`) |
| `SMOKE_PREFLIGHT_EMAIL` | Optional `beta:kitchen-preflight` in orchestrator |

## Data integrity

`workspace:post-backfill:verify:strict --sample-owners=N` now **exits 1** if any sampled workspace has `foreign` orders (same owner, different `workspace_id`).

Fix: `npm run workspace:reconcile:duplicates:execute`

## Next

Sprint 25: visual sign-off on production, `test:e2e:workspace-smoke` in CI with secrets, coverage 60%, GTM pilots.

# LIVE integrations staging smoke — 18 LIVE surfaces

Fleet orchestrator for merchant-credential live smokes against staging.

## Quick start

1. Copy `.env.smoke.example` → `.env.smoke.local` (gitignored).
2. Set shared staging env:
   - `E2E_STAGING_BASE_URL`
   - `DATABASE_URL`
   - `ENCRYPTION_KEY`
   - `CHANNEL_SMOKE_OWNER_EMAIL` or `CHANNEL_SMOKE_CONNECTION_ID`
3. Add per-provider merchant credentials (Path A direct keys or DB-loaded connections).
4. Run policy cert: `npm run test:ci:live-integrations-staging-smoke:cert`
5. Run fleet: `npm run smoke:live-integrations-staging`

## Fleet (18 surfaces)

17 LIVE providers (WooCommerce, Shopify, Uber Eats, DoorDash, Grubhub, Skip, QuickBooks, Xero, 7shifts, Homebase, Klaviyo, Mailchimp, Stripe, Square Payments, Moneris, OpenTable, Resy) plus Integration Health dashboard staging reachability probe.

## Behavior

- **Missing credentials** → `SKIPPED WITH REASON` (exit 0)
- **Real API / webhook failure** → `FAILED` (exit 1)
- **At least one PASSED, none FAILED** → fleet `PASSED`

## CI

- `.github/workflows/live-integrations-staging-smoke.yml`
- Cert job runs on every PR touching smoke wiring
- Fleet job runs on `workflow_dispatch` / weekly schedule when staging secrets are configured

## Artifacts

- `artifacts/live-integrations-staging-smoke-summary.json`

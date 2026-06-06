# Moneris LIVE smoke setup (Era 88)

Era 88 certifies the Moneris payment gateway path: OAuth → gateway verify → payment processing wiring.

## Prerequisites

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Postgres with integration connections |
| `MONERIS_ACCESS_TOKEN` or `MONERIS_API_TOKEN` | Direct path | OAuth access token or gateway API token |
| `MONERIS_STORE_ID` | Direct path | Moneris store identifier |
| `ENCRYPTION_KEY` | DB path | Decrypt stored OAuth tokens |
| `CHANNEL_SMOKE_OWNER_EMAIL` | DB path | Owner email with Moneris OAuth connection |
| `CHANNEL_SMOKE_CONNECTION_ID` | DB path (alt) | Specific connection row |

## Human activation

1. Provision a Moneris sandbox store (not `smoke-test` placeholder credentials).
2. Complete OAuth in **Dashboard → Integrations → Moneris** and confirm store ID is saved.
3. Set vault env vars above (or direct `MONERIS_*` for CI/local smoke).
4. Run the era88 orchestrator:

```bash
npm run smoke:moneris-live-era88
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:moneris-live` | Live gateway verify + payment wiring dry-run |
| `npm run smoke:moneris-live-era88` | Full era88 cert + wiring audit + live path |
| `npm run test:ci:moneris-live-smoke-era88` | Unit + smoke helper tests |
| `npm run test:ci:moneris-live-smoke-era88:cert` | Wiring cert only (CI gate) |

## Smoke steps

1. **Env validation** — direct token or DB tenant path
2. **Resolve connection** — OAuth connection from DB or direct env
3. **Gateway connection verify** — `verifyMonerisGatewayConnection` ping
4. **Payment gateway wiring** — dry-run SKIPPED (sandbox card token required for live purchase)

## Artifact

Summary written to `artifacts/moneris-live-smoke-summary.json` (gitignored).

## Honesty gate

Placeholder credentials (`smoke-test`, `placeholder`, `example`, `.local`) → **SKIPPED**, not FAILED.
Wiring cert always passes in CI when in-repo paths are present.

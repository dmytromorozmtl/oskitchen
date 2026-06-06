# OpenTable LIVE smoke setup (Era 89)

Era 89 certifies the OpenTable reservation path: OAuth → reservation webhook → table availability wiring.

## Prerequisites

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Postgres with integration connections |
| `OPENTABLE_ACCESS_TOKEN` or `OPENTABLE_API_KEY` | Direct path | OAuth access token |
| `OPENTABLE_RID` | Direct path | OpenTable restaurant ID |
| `OPENTABLE_WEBHOOK_SECRET` | Optional | Enables live webhook signature step |
| `ENCRYPTION_KEY` | DB path | Decrypt stored OAuth tokens |
| `CHANNEL_SMOKE_OWNER_EMAIL` | DB path | Owner email with OpenTable OAuth connection |
| `CHANNEL_SMOKE_CONNECTION_ID` | DB path (alt) | Specific connection row |

## Human activation

1. Provision an OpenTable sandbox restaurant (not `smoke-test` placeholder credentials).
2. Complete OAuth in **Dashboard → Integrations → OpenTable**; link storefront and register webhook URL.
3. Set vault env vars above (or direct `OPENTABLE_*` for CI/local smoke).
4. Run the era89 orchestrator:

```bash
npm run smoke:opentable-live-era89
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:opentable-live` | Live OAuth ping + webhook + availability wiring |
| `npm run smoke:opentable-live-era89` | Full era89 cert + wiring audit + live path |
| `npm run test:ci:opentable-live-smoke-era89` | Unit + smoke helper tests |
| `npm run test:ci:opentable-live-smoke-era89:cert` | Wiring cert only (CI gate) |

## Smoke steps

1. **Env validation** — direct token or DB tenant path
2. **Resolve connection** — OAuth connection from DB or direct env
3. **OAuth API connection** — `fetchOpenTableAvailability` ping
4. **Reservation webhook wiring** — HMAC signature verify (SKIPPED without `OPENTABLE_WEBHOOK_SECRET`)
5. **Table availability wiring** — `syncOpenTableAvailability` or read-only API fetch

## Artifact

Summary written to `artifacts/opentable-live-smoke-summary.json` (gitignored).

## Honesty gate

Placeholder credentials (`smoke-test`, `placeholder`, `example`, `.local`) → **SKIPPED**, not FAILED.
Wiring cert always passes in CI when in-repo paths are present.

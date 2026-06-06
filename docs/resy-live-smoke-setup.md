# Resy LIVE smoke setup (Era 90)

Era 90 certifies the Resy reservation path: OAuth → reservation webhook → waitlist sync wiring.

## Prerequisites

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Postgres with integration connections |
| `RESY_ACCESS_TOKEN` or `RESY_API_KEY` | Direct path | OAuth access token |
| `RESY_VENUE_ID` | Direct path | Resy venue identifier |
| `RESY_WEBHOOK_SECRET` | Optional | Enables live webhook signature step |
| `ENCRYPTION_KEY` | DB path | Decrypt stored OAuth tokens |
| `CHANNEL_SMOKE_OWNER_EMAIL` | DB path | Owner email with Resy OAuth connection |
| `CHANNEL_SMOKE_CONNECTION_ID` | DB path (alt) | Specific connection row |

## Human activation

1. Provision a Resy sandbox venue (not `smoke-test` placeholder credentials).
2. Complete OAuth in **Dashboard → Integrations → Resy**; link storefront and register webhook URL.
3. Set vault env vars above (or direct `RESY_*` for CI/local smoke).
4. Run the era90 orchestrator:

```bash
npm run smoke:resy-live-era90
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:resy-live` | Live OAuth ping + webhook + waitlist wiring |
| `npm run smoke:resy-live-era90` | Full era90 cert + wiring audit + live path |
| `npm run test:ci:resy-live-smoke-era90` | Unit + smoke helper tests |
| `npm run test:ci:resy-live-smoke-era90:cert` | Wiring cert only (CI gate) |

## Smoke steps

1. **Env validation** — direct token or DB tenant path
2. **Resolve connection** — OAuth connection from DB or direct env
3. **OAuth API connection** — `fetchResyWaitlist` ping
4. **Reservation sync wiring** — dry-run SKIPPED (storefront link required for import)
5. **Reservation webhook wiring** — HMAC signature verify (SKIPPED without `RESY_WEBHOOK_SECRET`)
6. **Waitlist sync wiring** — `syncResyWaitlist` or read-only API fetch

## Artifact

Summary written to `artifacts/resy-live-smoke-summary.json` (gitignored).

## Honesty gate

Placeholder credentials (`smoke-test`, `placeholder`, `example`, `.local`) → **SKIPPED**, not FAILED.
Wiring cert always passes in CI when in-repo paths are present.

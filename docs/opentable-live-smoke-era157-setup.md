# OpenTable LIVE integration setup (Era 157)

Era 157 certifies OpenTable LIVE integration wiring: OAuth, reservation webhook, and table availability — with sandbox proof via era89 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-opentable-live.ts` | Live OAuth → webhook → availability orchestrator |
| `services/integrations/opentable/reservation-webhook.service.ts` | Reservation webhook processor |
| `services/integrations/opentable/table-availability.service.ts` | Table availability sync |
| `services/integrations/opentable/opentable-api.ts` | OpenTable API client |
| `services/integrations/opentable/opentable-live-service.ts` | Live connection service |
| `app/api/webhooks/opentable/reservations/route.ts` | Webhook endpoint |
| `app/api/integrations/opentable/oauth/callback/route.ts` | OAuth callback |
| `app/api/integrations/opentable/availability/route.ts` | Availability API |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:opentable-live-era157` | Full era157 cert + wiring audit |
| `npm run test:ci:opentable-live-smoke-era157` | Era157 + era89 + integration tests |
| `npm run test:ci:opentable-live-smoke-era157:cert` | Wiring cert only (CI gate) |
| `npm run smoke:opentable-live` | Live sandbox OAuth proof |

## Human activation

1. Provision OpenTable sandbox restaurant (real credentials, not placeholder).
2. Complete OAuth in Dashboard → Integrations → OpenTable; link storefront + webhook URL.
3. Set `DATABASE_URL` + `ENCRYPTION_KEY` + `CHANNEL_SMOKE_OWNER_EMAIL`.
4. Run `npm run smoke:opentable-live` — live path PASSED.
5. Run `npm run smoke:opentable-live-era157` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `oauth` | OpenTable OAuth token flow |
| `reservation_webhook` | Signed reservation webhook ingest |
| `table_availability` | `syncOpenTableAvailability` |

## Artifact

Summary written to `artifacts/opentable-live-smoke-era157-smoke-summary.json` (gitignored).

See also: [opentable-live-smoke-setup.md](./opentable-live-smoke-setup.md)

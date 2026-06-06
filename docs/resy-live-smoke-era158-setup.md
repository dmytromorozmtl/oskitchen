# Resy LIVE integration setup (Era 158)

Era 158 certifies Resy LIVE integration wiring: OAuth, reservation sync, and waitlist — with sandbox proof via era90 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-resy-live.ts` | Live OAuth → reservation → waitlist orchestrator |
| `services/integrations/resy/reservation-sync.service.ts` | Reservation sync |
| `services/integrations/resy/waitlist-sync.service.ts` | Waitlist sync |
| `services/integrations/resy/reservation-webhook.service.ts` | Reservation webhook processor |
| `services/integrations/resy/resy-api.ts` | Resy API client |
| `services/integrations/resy/resy-live-service.ts` | Live connection service |
| `app/api/webhooks/resy/reservations/route.ts` | Webhook endpoint |
| `app/api/integrations/resy/oauth/callback/route.ts` | OAuth callback |
| `app/api/integrations/resy/sync-reservations/route.ts` | Reservation sync API |
| `app/api/integrations/resy/sync-waitlist/route.ts` | Waitlist sync API |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:resy-live-era158` | Full era158 cert + wiring audit |
| `npm run test:ci:resy-live-smoke-era158` | Era158 + era90 + integration tests |
| `npm run test:ci:resy-live-smoke-era158:cert` | Wiring cert only (CI gate) |
| `npm run smoke:resy-live` | Live sandbox OAuth proof |

## Human activation

1. Provision Resy sandbox venue (real credentials, not placeholder).
2. Complete OAuth in Dashboard → Integrations → Resy; link storefront + webhook URL.
3. Set `DATABASE_URL` + `ENCRYPTION_KEY` + `CHANNEL_SMOKE_OWNER_EMAIL`.
4. Run `npm run smoke:resy-live` — live path PASSED.
5. Run `npm run smoke:resy-live-era158` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `oauth` | Resy OAuth token flow |
| `reservation_sync` | `syncResyReservations` + webhook |
| `waitlist` | `syncResyWaitlist` |

## Artifact

Summary written to `artifacts/resy-live-smoke-era158-smoke-summary.json` (gitignored).

See also: [resy-live-smoke-setup.md](./resy-live-smoke-setup.md)

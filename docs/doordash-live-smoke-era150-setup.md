# DoorDash LIVE integration setup (Era 150)

Era 150 certifies DoorDash LIVE integration wiring: OAuth/Drive API, signed orders webhook, menu sync, KDS kitchen import, and status sync — with partner sandbox proof via era77 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-doordash-live.ts` | Live Drive API → webhook → menu sync → KDS orchestrator |
| `services/integrations/doordash/doordash-marketplace.ts` | Drive API marketplace client |
| `services/integrations/doordash/menu-sync.service.ts` | Menu push/pull sync |
| `services/integrations/doordash/kitchen-import.service.ts` | ExternalOrder → KDS import |
| `services/integrations/doordash/status-sync.service.ts` | Kitchen bump → DoorDash status |
| `app/api/webhooks/doordash/orders/route.ts` | Signed webhook endpoint |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:doordash-live-era150` | Full era150 cert + wiring audit |
| `npm run test:ci:doordash-live-smoke-era150` | Era150 + era77 + integration tests |
| `npm run test:ci:doordash-live-smoke-era150:cert` | Wiring cert only (CI gate) |
| `npm run smoke:doordash-live` | Live partner sandbox proof |

## Human activation

1. Provision DoorDash partner sandbox merchant ID (not `smoke-test-merchant-id`).
2. Save API key or complete OAuth in Dashboard → Integrations → DoorDash.
3. Register orders webhook with matching signing secret.
4. Set `DATABASE_URL` + `ENCRYPTION_KEY` + `CHANNEL_SMOKE_OWNER_EMAIL`.
5. Run `npm run smoke:doordash-live` — live path PASSED.
6. Run `npm run smoke:doordash-live-era150` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `oauth` | Partner OAuth / API key |
| `drive_api` | doordash-marketplace.ts |
| `webhook` | Signed orders webhook |
| `menu_sync` | menu-sync.service.ts |
| `kds_import` | importDoorDashOrderToKitchen |
| `status_sync` | syncDoorDashStatusFromKitchenOrder |

## Artifact

Summary written to `artifacts/doordash-live-smoke-era150-smoke-summary.json` (gitignored).

See also: [doordash-live-smoke-setup.md](./doordash-live-smoke-setup.md)

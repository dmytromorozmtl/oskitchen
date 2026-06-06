# Grubhub LIVE integration setup (Era 152)

Era 152 certifies Grubhub LIVE integration wiring: OAuth, signed orders webhook, menu sync, KDS kitchen import, and status sync — with partner sandbox proof via era78 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-grubhub-live.ts` | Live OAuth → webhook → menu sync → KDS orchestrator |
| `services/integrations/grubhub/menu-sync.service.ts` | Menu push/pull sync |
| `services/integrations/grubhub/kitchen-import.service.ts` | ExternalOrder → KDS import |
| `services/integrations/grubhub/status-sync.service.ts` | Kitchen bump → Grubhub status |
| `app/api/webhooks/grubhub/orders/route.ts` | Signed webhook endpoint |
| `services/integrations/grubhub/grubhub-marketplace.ts` | Grubhub marketplace API client |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:grubhub-live-era152` | Full era152 cert + wiring audit |
| `npm run test:ci:grubhub-live-smoke-era152` | Era152 + era78 + integration tests |
| `npm run test:ci:grubhub-live-smoke-era152:cert` | Wiring cert only (CI gate) |
| `npm run smoke:grubhub-live` | Live partner sandbox proof |

## Human activation

1. Provision Grubhub partner sandbox merchant ID (not `smoke-test-merchant-id`).
2. Save API key or complete OAuth in Dashboard → Integrations → Grubhub.
3. Register orders webhook with matching signing secret.
4. Set `DATABASE_URL` + `ENCRYPTION_KEY` + `CHANNEL_SMOKE_OWNER_EMAIL`.
5. Run `npm run smoke:grubhub-live` — live path PASSED.
6. Run `npm run smoke:grubhub-live-era152` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `oauth` | Partner OAuth / API key |
| `webhook` | Signed orders webhook |
| `menu_sync` | menu-sync.service.ts |
| `kds_import` | importGrubhubOrderToKitchen |
| `status_sync` | syncGrubhubStatusFromKitchenOrder |

## Artifact

Summary written to `artifacts/grubhub-live-smoke-era152-smoke-summary.json` (gitignored).

See also: [grubhub-live-smoke-setup.md](./grubhub-live-smoke-setup.md)

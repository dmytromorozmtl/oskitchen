# Skip/Just Eat LIVE integration setup (Era 151)

Era 151 certifies Skip/Just Eat LIVE integration wiring: OAuth, signed orders webhook, KDS kitchen import, and status sync — with partner sandbox proof via era79 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-skip-live.ts` | Live OAuth → webhook → KDS → status sync orchestrator |
| `services/integrations/skip/kitchen-import.service.ts` | ExternalOrder → KDS import |
| `services/integrations/skip/inbound-order.service.ts` | Webhook order ingestion |
| `services/integrations/skip/status-sync.service.ts` | Kitchen bump → Skip status |
| `app/api/webhooks/skip/orders/route.ts` | Signed webhook endpoint |
| `services/integrations/skip/skip-marketplace.ts` | Skip marketplace API client |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:skip-live-era151` | Full era151 cert + wiring audit |
| `npm run test:ci:skip-live-smoke-era151` | Era151 + era79 + integration tests |
| `npm run test:ci:skip-live-smoke-era151:cert` | Wiring cert only (CI gate) |
| `npm run smoke:skip-live` | Live partner sandbox proof |

## Human activation

1. Provision Skip/Just Eat partner sandbox restaurant ID (not `smoke-test-restaurant-id`).
2. Complete OAuth in Dashboard → Integrations → Skip.
3. Register orders webhook with matching signing secret.
4. Set `DATABASE_URL` + `ENCRYPTION_KEY` + `CHANNEL_SMOKE_OWNER_EMAIL`.
5. Run `npm run smoke:skip-live` — live path PASSED.
6. Run `npm run smoke:skip-live-era151` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `oauth` | Partner OAuth token exchange |
| `webhook` | Signed orders webhook |
| `kds_import` | importSkipOrderToKitchen |
| `status_sync` | syncSkipStatusFromKitchenOrder |

## Artifact

Summary written to `artifacts/skip-live-smoke-era151-smoke-summary.json` (gitignored).

See also: [skip-live-smoke-setup.md](./skip-live-smoke-setup.md)

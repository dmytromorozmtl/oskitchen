# Uber Eats LIVE integration setup (Era 149)

Era 149 certifies Uber Eats LIVE integration wiring: OAuth, signed orders webhook, KDS kitchen import, and status sync — with partner sandbox proof via era76 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-uber-eats-live.ts` | Live OAuth → webhook → KDS → status sync orchestrator |
| `services/integrations/uber-eats/kitchen-import.service.ts` | ExternalOrder → KDS import |
| `services/integrations/uber-eats/inbound-order.service.ts` | Webhook order ingestion |
| `services/integrations/uber-eats/status-sync.service.ts` | Kitchen bump → Uber status |
| `app/api/webhooks/uber-eats/orders/route.ts` | Signed webhook endpoint |
| `lib/integrations/integration-registry.ts` | Registry LIVE status |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:uber-eats-live-era149` | Full era149 cert + wiring audit |
| `npm run test:ci:uber-eats-live-smoke-era149` | Era149 + era76 + integration tests |
| `npm run test:ci:uber-eats-live-smoke-era149:cert` | Wiring cert only (CI gate) |
| `npm run smoke:uber-eats-live` | Live partner sandbox proof |

## Human activation

1. Provision Uber Eats partner sandbox store UUID (not `smoke-test-store-uuid`).
2. Complete OAuth in Dashboard → Integrations → Uber Eats.
3. Register orders webhook with matching signing secret.
4. Set `DATABASE_URL` + `ENCRYPTION_KEY` + `CHANNEL_SMOKE_OWNER_EMAIL`.
5. Run `npm run smoke:uber-eats-live` — live path PASSED.
6. Run `npm run smoke:uber-eats-live-era149` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `oauth` | Partner token exchange |
| `webhook` | Signed orders webhook |
| `kds_import` | importUberEatsOrderToKitchen |
| `status_sync` | syncUberEatsStatusFromKitchenOrder |

## Artifact

Summary written to `artifacts/uber-eats-live-smoke-era149-smoke-summary.json` (gitignored).

See also: [uber-eats-live-smoke-setup.md](./uber-eats-live-smoke-setup.md)

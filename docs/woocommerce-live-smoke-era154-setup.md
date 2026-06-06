# WooCommerce LIVE integration setup (Era 154)

Era 154 certifies WooCommerce LIVE integration wiring: REST API, signed webhook, canonical ExternalOrder, KDS kitchen import, and inventory sync — with dev store proof via era71 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-woocommerce-live.ts` | Live REST → webhook → KDS → inventory orchestrator |
| `services/integrations/woocommerce/kitchen-import.service.ts` | ExternalOrder → KDS import |
| `services/integrations/woocommerce/inventory-sync.service.ts` | Order-driven inventory sync |
| `lib/webhooks/woocommerce-webhook-processor.ts` | Signed webhook + canonical order |
| `app/api/webhooks/woocommerce/route.ts` | Webhook endpoint |
| `app/api/integrations/woocommerce/sync-products/route.ts` | Product sync API |
| `app/api/integrations/woocommerce/sync-orders/route.ts` | Order sync API |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:woocommerce-live-era154` | Full era154 cert + wiring audit |
| `npm run test:ci:woocommerce-live-smoke-era154` | Era154 + era71 + integration tests |
| `npm run test:ci:woocommerce-live-smoke-era154:cert` | Wiring cert only (CI gate) |
| `npm run smoke:woo-live` | Live dev store proof |

## Human activation

1. Provision HTTPS WooCommerce dev store with COD enabled (real host, not placeholder).
2. Save connection in Dashboard → Integrations → WooCommerce; register webhook with matching secret.
3. Set `DATABASE_URL` + `ENCRYPTION_KEY` + `CHANNEL_SMOKE_OWNER_EMAIL`.
4. Run `npm run smoke:woo-live` — live path PASSED.
5. Run `npm run smoke:woocommerce-live-era154` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `rest_api` | WooCommerce REST API credentials |
| `webhook` | Signed order.created webhook |
| `canonical_order` | `persistNormalizedExternalOrder` → ExternalOrder |
| `kds_inventory` | KDS import + inventory sync |

## Artifact

Summary written to `artifacts/woocommerce-live-smoke-era154-smoke-summary.json` (gitignored).

See also: [woocommerce-live-smoke-setup.md](./woocommerce-live-smoke-setup.md)

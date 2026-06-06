# WooCommerce LIVE smoke setup (Era 144)

Era 144 certifies WooCommerce LIVE smoke wiring: dev store REST → signed webhook → KDS kitchen import → inventory sync.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-woocommerce-live.ts` | Live smoke orchestrator — REST, webhook, KDS, inventory steps |
| `services/integrations/woocommerce/kitchen-import.service.ts` | `importWooCommerceOrderToKitchen` |
| `services/integrations/woocommerce/inventory-sync.service.ts` | `syncWooCommerceInventoryFromOrder` |
| `lib/webhooks/woocommerce-webhook-processor.ts` | Webhook → kitchen + inventory |
| `app/api/webhooks/woocommerce/route.ts` | Staging webhook endpoint |
| `app/api/integrations/woocommerce/sync-products/route.ts` | Product sync API |
| `app/api/integrations/woocommerce/sync-orders/route.ts` | Order sync API |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:woocommerce-live-era144` | Full era144 cert + wiring audit |
| `npm run test:ci:woocommerce-live-smoke-era144` | Era144 + era71 + smoke unit tests |
| `npm run test:ci:woocommerce-live-smoke-era144:cert` | Wiring cert only (CI gate) |
| `npm run smoke:woo-live` | Live dev store path (requires credentials) |
| `npm run smoke:woocommerce-live-era71` | Era71 cert + optional live run |

## Human activation

1. Provision HTTPS WooCommerce dev store (real host, COD enabled).
2. Save connection in **Dashboard → Integrations → WooCommerce**.
3. Set `DATABASE_URL`, `ENCRYPTION_KEY`, `CHANNEL_SMOKE_OWNER_EMAIL`.
4. Run `npm run smoke:woo-live` — era71 artifact **PASSED**.
5. Run `npm run smoke:woocommerce-live-era144` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `rest_api` | WooCommerce REST connection + test order |
| `webhook` | Signed webhook delivery to staging |
| `kds_inventory` | ExternalOrder → KDS import + inventory on order.created |

## Artifacts

| Artifact | Role |
|----------|------|
| `artifacts/woocommerce-live-smoke-era144-smoke-summary.json` | Era144 wiring cert (gitignored) |
| `artifacts/woocommerce-live-smoke-summary.json` | Era71 live smoke result |

See also: [woocommerce-live-smoke-setup.md](./woocommerce-live-smoke-setup.md)

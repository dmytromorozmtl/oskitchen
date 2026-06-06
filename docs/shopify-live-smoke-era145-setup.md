# Shopify LIVE smoke setup (Era 145)

Era 145 certifies Shopify LIVE smoke wiring: dev store Admin API → signed orders/create webhook → KDS kitchen import → inventory sync.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-shopify-live.ts` | Live smoke orchestrator — Admin API, webhook, KDS, inventory steps |
| `services/integrations/shopify/kitchen-import.service.ts` | `importShopifyOrderToKitchen` |
| `services/integrations/shopify/inventory-sync.service.ts` | `syncShopifyInventoryFromOrder` |
| `lib/webhooks/shopify-webhook-processor.ts` | Webhook → kitchen + inventory |
| `app/api/webhooks/shopify/orders-create/route.ts` | Staging orders/create webhook endpoint |
| `app/api/integrations/shopify/sync-products/route.ts` | Product sync API |
| `app/api/integrations/shopify/sync-orders/route.ts` | Order sync API |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:shopify-live-era145` | Full era145 cert + wiring audit |
| `npm run test:ci:shopify-live-smoke-era145` | Era145 + era72 + smoke unit tests |
| `npm run test:ci:shopify-live-smoke-era145:cert` | Wiring cert only (CI gate) |
| `npm run smoke:shopify-live` | Live dev store path (requires credentials) |
| `npm run smoke:shopify-live-era72` | Era72 cert + optional live run |

## Human activation

1. Provision Shopify development store (real myshopify.com host).
2. Create custom app; copy Admin API access token.
3. Save connection in **Dashboard → Integrations → Shopify**.
4. Set `DATABASE_URL`, `ENCRYPTION_KEY`, `CHANNEL_SMOKE_OWNER_EMAIL`.
5. Run `npm run smoke:shopify-live` — era72 artifact **PASSED**.
6. Run `npm run smoke:shopify-live-era145` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `admin_api` | Shopify Admin API connection + test order |
| `webhook` | Signed orders/create webhook delivery to staging |
| `kds_inventory` | ExternalOrder → KDS import + inventory on orders/create |

## Artifacts

| Artifact | Role |
|----------|------|
| `artifacts/shopify-live-smoke-era145-smoke-summary.json` | Era145 wiring cert (gitignored) |
| `artifacts/shopify-live-smoke-summary.json` | Era72 live smoke result |

See also: [shopify-live-smoke-setup.md](./shopify-live-smoke-setup.md)

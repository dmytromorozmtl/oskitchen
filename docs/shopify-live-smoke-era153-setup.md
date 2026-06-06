# Shopify LIVE integration setup (Era 153)

Era 153 certifies Shopify LIVE integration wiring: Admin API, signed orders/create webhook, KDS kitchen import, and inventory sync — with dev store proof via era72 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-shopify-live.ts` | Live Admin API → webhook → KDS → inventory orchestrator |
| `services/integrations/shopify/kitchen-import.service.ts` | ExternalOrder → KDS import |
| `services/integrations/shopify/inventory-sync.service.ts` | Order-driven inventory sync |
| `lib/webhooks/shopify-webhook-processor.ts` | Signed webhook processor |
| `app/api/webhooks/shopify/orders-create/route.ts` | Webhook endpoint |
| `app/api/integrations/shopify/sync-products/route.ts` | Product sync API |
| `app/api/integrations/shopify/sync-orders/route.ts` | Order sync API |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:shopify-live-era153` | Full era153 cert + wiring audit |
| `npm run test:ci:shopify-live-smoke-era153` | Era153 + era72 + integration tests |
| `npm run test:ci:shopify-live-smoke-era153:cert` | Wiring cert only (CI gate) |
| `npm run smoke:shopify-live` | Live dev store proof |

## Human activation

1. Provision Shopify development store (real myshopify.com host, not placeholder).
2. Create custom app with read_orders + write_orders; copy Admin API token.
3. Save connection in Dashboard → Integrations → Shopify; register orders/create webhook.
4. Set `DATABASE_URL` + `ENCRYPTION_KEY` + `CHANNEL_SMOKE_OWNER_EMAIL`.
5. Run `npm run smoke:shopify-live` — live path PASSED.
6. Run `npm run smoke:shopify-live-era153` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `admin_api` | Shopify Admin API token |
| `webhook` | Signed orders/create webhook |
| `kds_inventory` | KDS import + inventory sync |

## Artifact

Summary written to `artifacts/shopify-live-smoke-era153-smoke-summary.json` (gitignored).

See also: [shopify-live-smoke-setup.md](./shopify-live-smoke-setup.md)

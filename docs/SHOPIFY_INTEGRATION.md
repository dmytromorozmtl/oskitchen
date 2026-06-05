# Shopify integration (LIVE)

OS Kitchen ships a **LIVE** Shopify connector: development-store ready, HMAC webhook verification, KDS order import, and bidirectional inventory sync.

## Competitor comparison

| Capability | Shopify-only ops | OS Kitchen Shopify LIVE |
|------------|------------------|-------------------------|
| Order ingest | Shopify admin | Webhook → `external_orders` + kitchen `orders` (KDS) |
| KDS ticket | Manual / third-party | Automatic on `orders/create` |
| Webhook security | Shopify HMAC | `verifyShopifyHmac` + idempotent events |
| Inventory | Shopify stock only | Kitchen decrement + `inventory_levels/set` push |

## Sales pitch

> "Shopify orders hit your KDS instantly — kitchen stock stays in sync with your dev store or production shop."

## Dev store setup

See [`WOO_SHOPIFY_TEST_SHOP_SETUP.md`](./WOO_SHOPIFY_TEST_SHOP_SETUP.md) and [`shopify-live-smoke-setup.md`](./shopify-live-smoke-setup.md).

## Endpoints

```text
POST /api/webhooks/shopify/orders-create
POST /api/webhooks/shopify/orders-updated
POST /api/webhooks/shopify/products-update
POST /api/integrations/shopify/sync-orders
```

## Required credentials

Per-tenant (dashboard) or smoke env:

```bash
SHOPIFY_SHOP_DOMAIN=
SHOPIFY_ADMIN_ACCESS_TOKEN=
SHOPIFY_APP_SECRET=
```

## How to test

```bash
node ./node_modules/.bin/vitest run \
  tests/unit/shopify-kitchen-import.test.ts \
  tests/unit/shopify-inventory-sync.test.ts
```

## Honesty

Registry status is **LIVE**. G3/G4 production uptime proof is measured per-tenant — see Integration Health DoD panel.

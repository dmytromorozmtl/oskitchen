# WooCommerce integration (LIVE)

OS Kitchen ships a **LIVE** WooCommerce connector: dev-store ready, REST API, HMAC webhook verification, canonical order normalization, KDS import, and inventory sync.

## Competitor comparison

| Capability | Woo-only ops | OS Kitchen WooCommerce LIVE |
|------------|--------------|-----------------------------|
| Order ingest | Woo admin | Webhook → `external_orders` + kitchen `orders` (KDS) |
| KDS ticket | Manual / plugin | Automatic on `order.created` |
| Webhook security | Woo HMAC | `verifyWebhookSignature` + idempotent events |
| Inventory | Woo stock only | Kitchen decrement + REST stock push |

## Sales pitch

> "WooCommerce orders land on your KDS instantly — kitchen inventory stays aligned with your WordPress store."

## Dev store setup

See [`WOO_SHOPIFY_TEST_SHOP_SETUP.md`](./WOO_SHOPIFY_TEST_SHOP_SETUP.md) and [`woocommerce-live-smoke-setup.md`](./woocommerce-live-smoke-setup.md).

## Endpoints

```text
POST /api/webhooks/woocommerce?cid=<connection-id>
POST /api/integrations/woocommerce/sync-orders
POST /api/integrations/woocommerce/sync-products
```

## Required credentials

Per-tenant (dashboard) or smoke env:

```bash
WOOCOMMERCE_BASE_URL=
WOOCOMMERCE_CONSUMER_KEY=
WOOCOMMERCE_CONSUMER_SECRET=
WOOCOMMERCE_WEBHOOK_SECRET=
```

## How to test

```bash
node ./node_modules/.bin/vitest run \
  tests/unit/woocommerce-kitchen-import.test.ts \
  tests/unit/woocommerce-inventory-sync.test.ts
```

## Honesty

Registry status is **LIVE**. G3/G4 production uptime proof is measured per-tenant — see Integration Health DoD panel.

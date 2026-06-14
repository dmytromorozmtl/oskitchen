# WooCommerce merchant proof — bi-directional inventory sync (P0-10)

**Policy:** `p0-10-woocommerce-merchant-proof-v1`  
**Updated:** 2026-06-14  
**Artifact:** `artifacts/woocommerce-merchant-proof-inventory-sync.json`

## Proof chain

1. **KDS chain** (P0-2): `order.created` webhook → WebhookEvent → ExternalOrder → KitchenTask → KDS bump (READY)
2. **Outbound inventory**: `order.created` → `syncWooCommerceInventoryFromOrder` → kitchen qty decrement → Woo REST push
3. **Inbound inventory**: `product.updated` → `syncWooCommerceInventoryFromProductWebhook` → kitchen qty pull from `stock_quantity`

## Smoke

```bash
npm run smoke:woo-live
npm run test:ci:woocommerce-merchant-proof-p0-10
```

Requires `.env.smoke.local` with staging DB + Woo connection (see `docs/woocommerce-live-smoke-setup.md`).

## Honesty

- Placeholder Woo store hosts skip live REST ping; webhook + DB proof still runs inline.
- Outbound Woo push may fail on unreachable dev store — kitchen decrement is the primary proof signal in synthetic mode.

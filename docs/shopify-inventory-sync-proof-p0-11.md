# Shopify bi-directional inventory sync proof (P0-11)

**Policy:** `p0-11-shopify-inventory-sync-proof-v1`  
**Updated:** 2026-06-14  
**Artifact:** `artifacts/shopify-inventory-sync-proof.json`

## Proof chain

1. **KDS chain** (P0-3): `orders/create` webhook → WebhookEvent → ExternalOrder → KitchenTask → KDS bump (READY)
2. **Outbound inventory**: `orders/create` → `syncShopifyInventoryFromOrder` → kitchen qty decrement → Shopify Admin inventory_levels/set
3. **Inbound inventory**: `products/update` → `syncShopifyInventoryFromProductWebhook` → kitchen qty pull from variant `inventory_quantity`

## Smoke + E2E

```bash
npm run smoke:shopify-live
npm run test:ci:shopify-inventory-sync-proof-p0-11
npx playwright test e2e/shopify-inventory-sync-proof.spec.ts
```

## Honesty

- Placeholder Shopify dev stores skip live Admin API ping; webhook + DB proof runs inline.
- Outbound Shopify push may fail on unreachable dev store — kitchen decrement is the primary proof signal in synthetic mode.

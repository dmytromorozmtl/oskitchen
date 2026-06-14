# Shopify real-time inventory sync proof (P1-32)

**Policy:** `shopify-realtime-inventory-sync-proof-p1-32-v1`  
**Artifact:** [`artifacts/shopify-realtime-inventory-sync-proof-p1-32.json`](../artifacts/shopify-realtime-inventory-sync-proof-p1-32.json)

## Proof chain

Extends P0-11 bi-directional sync with **real-time** `inventory_levels/update` webhook:

1. **Fixture** — mapped Shopify variant with `inventory_item_id: 99001`
2. **Webhook** — synthetic `inventory_levels/update` with `available: 14`
3. **Kitchen update** — `syncShopifyInventoryFromInventoryLevelWebhook` → storefront qty
4. **Latency budget** — ingest → DB update ≤ 5000ms (synthetic smoke)

P0-11 covers `orders/create` outbound + `products/update` inbound. P1-32 adds Shopify's location-level real-time webhook.

## Verify

```bash
npm run check:shopify-realtime-inventory-sync-proof-p1-32
npx playwright test e2e/shopify-realtime-inventory-sync-proof.spec.ts
```

## Honesty

- Dev placeholder stores run synthetic webhook proof inline (no live Shopify Admin ping required).
- Live merchant proof requires registered `inventory_levels/update` webhook on the Shopify app.

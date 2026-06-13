# Idempotency keys (P3-78)

**Policy:** `idempotency-keys-p3-78-v1`  
**Department:** Backend  
**Upstream:** `idempotency-keys-p1-32-v1`  
**Registry:** [`artifacts/idempotency-keys-p3-78-registry.json`](../artifacts/idempotency-keys-p3-78-registry.json)

---

## Critical surfaces

| Surface | Service | Key builder |
|---------|---------|-------------|
| Webhook processing | `lib/webhooks/webhook-event-store.ts` | `webhookProcessingKey` |
| Marketplace capture | `services/marketplace/*` | `marketplacePaymentIntentKey` |
| POS checkout (offline sync) | `services/pos/pos-checkout-service.ts` | `posCheckoutIdempotencyKey` |
| POS refund | `services/pos/pos-refund-service.ts` | `posRefundIdempotencyKey` |
| POS void | `services/pos/pos-void-service.ts` | `posVoidIdempotencyKey` |
| Vendor payout | `services/marketplace/vendor-finance-service.ts` | `buildStablePayoutId` |

P3-78 completes POS checkout/void wiring on top of P1-32 registry audit.

---

## Verify

```bash
npm run test:ci:idempotency-keys
npm run check:idempotency-keys-p3-78
npm run audit:idempotency-keys-p3-78
npm run test:ci:idempotency-keys-p3-78:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` (P3-78 cert audit)

---

## Status

P1-32 registry covers webhook, payment capture, and payout builders. P3-78 adds POS checkout offline dedupe audit metadata and POS void audit idempotency keys.

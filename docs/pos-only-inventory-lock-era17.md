# Era 17 — POS-only inventory lock recert

**Policy:** `era17-pos-only-inventory-lock-v1`  
**Status:** **pos_only_lock_recertified**  
**Extends:** `era4-pos-only-v1`, `era5-pos-only-gtm-lock-v1`  
**Storefront hook:** **deferred_locked** (unchanged)

KitchenOS recipe ingredient depletion on sale is **certified for POS checkout only**. Storefront, public API, manual, and integration order entrypoints must **not** call POS inventory impact recording until an explicit future era unlocks payment-timing + idempotency design.

---

## Certified path (POS only)

| Step | Location |
|------|----------|
| POS checkout completes | `services/pos/pos-checkout-service.ts` |
| Impact recording | `recordPendingInventoryImpactsForPosOrder` |
| Recipe depletion | `applyRecipeDepletionForPosLine` |

Evidence: `test:ci:pos-money-path:inventory`, `tests/integration/pos-inventory-depletion.integration.test.ts`

---

## Non-depleting entrypoints (Era 17 scan)

These paths create orders but **must not** import POS depletion hooks:

| Entrypoint | Channel |
|------------|---------|
| `actions/storefront-order.ts` | Storefront |
| `actions/order-creation.ts` | Manual |
| `app/api/public/v1/orders/route.ts` | Public API |
| `services/orders/order-creation-service.ts` | Manual / shared |
| `lib/webhooks/woocommerce-handler.ts` | Woo integration |
| `lib/webhooks/shopify-handler.ts` | Shopify integration |

---

## Pilot / sales wording

**Allowed:**

- "POS sales deplete recipe ingredients when products have active recipes configured."
- "Storefront and online orders do **not** reduce on-hand inventory in pilot scope."

**Forbidden:**

- Unified cross-channel depletion
- Storefront checkout depletes stock
- All channels deplete on-hand inventory

Enforcement: `npm run smoke:pilot-forbidden-claims-enforcement` + `era17-pilot-forbidden-claims-enforcement-v1`.

---

## Validation

```bash
npm run test:ci:inventory-depletion:cert
npm run test:ci:pos-only-inventory-lock-era17:cert
npm run smoke:pos-only-inventory-lock
```

Review **`artifacts/pos-only-inventory-lock-summary.json`** — `lockProofStatus` must be `proof_passed`.

---

## Unlock criteria (future era only)

Storefront/API depletion requires:

1. Explicit era decision lifting `era5-pos-only-gtm-lock-v1`
2. Payment-timing + idempotency + refund/cancel policy
3. Integration tests + maturity matrix update
4. No unified stock claim without full channel cert

**Not in Era 17 scope.**

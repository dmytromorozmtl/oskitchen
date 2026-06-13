# Loyalty earn/redeem — Square parity (P2-41)

**Policy:** `loyalty-earn-redeem-p2-41-v1`  
**Department:** Loyalty  
**Registry:** [`artifacts/loyalty-earn-redeem-p2-41-registry.json`](../artifacts/loyalty-earn-redeem-p2-41-registry.json)

---

## Square parity scope

Guests **earn points** on storefront orders and **redeem at checkout** for order credit — browser storefront path (not native Square app).

| Step | Behavior |
|------|----------|
| Earn | `pointsPerDollar × subtotal` on order confirm (pay later) or Stripe paid |
| Redeem | Blocks of `redeemPoints` → `redeemAmount` credit at checkout |
| Balance | `/api/storefront/loyalty/balance?storeSlug=&email=` |

> Square parity — storefront earn on order, redeem at checkout, balance by email. POS loyalty path covered separately (P2-31 E2E).

---

## Flow

1. **Lookup balance by email** — checkout panel fetches balance when guest enters email.
2. **Redeem points at checkout** — `loyaltyPointsRedeem` on submit; discount applied to order total.
3. **Earn points on order** — `earnStorefrontLoyaltyPoints` after pay-later submit or Stripe `checkout.session.completed`.
4. **Restore on payment failure** — online checkout restores redeemed points if Stripe payment fails.

---

## Wiring

| Path | Role |
|------|------|
| `services/storefront/loyalty-service.ts` | earn, redeem, restore |
| `components/storefront/storefront-loyalty-checkout-panel.tsx` | Guest UI |
| `components/storefront/store-checkout-client.tsx` | Checkout integration |
| `actions/storefront-order.ts` | Redeem in txn + earn pay-later |
| `services/storefront/storefront-stripe-checkout-service.ts` | Earn on paid |
| `app/api/storefront/loyalty/balance/route.ts` | Balance API |
| `app/api/storefront/loyalty/redeem/route.ts` | Redeem API |

---

## Audit

```bash
npm run audit:loyalty-earn-redeem-p2-41
npm run check:loyalty-earn-redeem-p2-41
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` — Loyalty earn/redeem P2-41 audit step.

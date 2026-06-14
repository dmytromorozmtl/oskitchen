# Loyalty earn/redeem LIVE — POS + storefront (P2-62)

**Policy:** `loyalty-earn-redeem-p2-62-v1`  
**Status:** **LIVE** — POS and storefront earn/redeem  
**Updated:** 2026-06-16

Gap closure: promote loyalty from preview → LIVE with POS integration earn/redeem (Square parity for in-house channels).

## Square parity scope

| Channel | Earn | Redeem | Balance |
|---------|------|--------|---------|
| POS terminal | `earnLoyaltyPointsForOrder` after sale | `redeemLoyaltyPoints` at checkout | CRM + POS payment panel |
| Storefront | P2-41 earn on order | P2-41 redeem at checkout | `/api/storefront/loyalty/balance` |

> Square parity — POS + storefront earn on order, redeem at checkout. Not certified third-party Square Loyalty API.

## POS flow

1. Attach customer on POS terminal.
2. Enter points to redeem (`pos-loyalty-redeem-input`); balance shown via `pos-loyalty-balance`.
3. `checkoutPosSale` applies loyalty discount, then earns points on completed sale.

Upstream E2E: P2-31 / P1-36 Playwright specs. Storefront: [P2-41](./loyalty-earn-redeem-p2-41.md).

## Nav maturity

`/dashboard/customers/loyalty` and `/dashboard/storefront/loyalty` promoted from **preview** → **default** (visible in focused sidebar).

## CI

```bash
npm run check:loyalty-earn-redeem-p2-62
```

## Artifact

`artifacts/loyalty-earn-redeem-p2-62.json`

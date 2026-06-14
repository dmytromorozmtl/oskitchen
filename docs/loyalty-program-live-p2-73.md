# Loyalty program earn/redeem LIVE — full E2E POS + storefront (P2-73)

**Policy:** `loyalty-program-live-p2-73-v1`  
**Status:** **LIVE** — full loyalty program across POS and storefront  
**Updated:** 2026-06-16

Gap closure: complete loyalty program with earn → CRM balance → redeem on next order for both POS and storefront channels.

## Full chain

```
order_earn → crm_balance → redeem_apply → balance_updated
```

| Channel | Earn | Redeem | Balance |
|---------|------|--------|---------|
| POS | `earnLoyaltyPointsForOrder` after sale | `redeemLoyaltyPoints` at checkout | CRM + `pos-loyalty-balance` |
| Storefront | P2-41 earn on paid order | `storefront-loyalty-redeem` at checkout | `/api/storefront/loyalty/balance` |

> POS and storefront use separate ledgers (kitchen vs storefront). Each channel earns and redeems within its own ledger; CRM reflects the linked customer balance per channel.

## Upstream policies

- [P2-62](./loyalty-earn-redeem-p2-62.md) — POS + storefront LIVE nav
- [P2-41](./loyalty-earn-redeem-p2-41.md) — storefront earn/redeem measurement
- [P1-36](./loyalty-earn-redeem-e2e-p1-36.md) — E2E chain order→points→CRM→apply

## Dashboard UI

`/dashboard/customers/loyalty` shows the **Earn/redeem LIVE** panel with POS and storefront channel wiring (`loyalty-program-live-panel`).

## Flow benchmark

Six scenarios cover POS earn/redeem, insufficient balance, storefront earn/apply, minimum redeem block, multi-order accumulation, and full CRM chain.

## CI

```bash
npm run check:loyalty-program-live-p2-73
```

## Artifact

`artifacts/loyalty-program-live-p2-73.json`

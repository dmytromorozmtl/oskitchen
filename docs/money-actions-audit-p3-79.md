# Money actions audit log (P3-79)

**Policy:** `money-actions-audit-p3-79-v1`  
**Department:** Backend  
**Upstream:** `money-actions-audit-p1-31-v1`  
**Registry:** [`artifacts/money-actions-audit-p3-79-registry.json`](../artifacts/money-actions-audit-p3-79-registry.json)

---

## Surfaces

| Kind | Action | Service / route |
|------|--------|-----------------|
| payment | `POS_PAYMENT_RECORDED` | `services/pos/pos-checkout-service.ts` |
| refund | `POS_TRANSACTION_REFUNDED` | `services/pos/pos-refund-service.ts` |
| void | `POS_TRANSACTION_VOIDED` | `services/pos/pos-void-service.ts` |
| payout | `VENDOR_PAYOUT_REQUESTED` | `services/marketplace/vendor-finance-service.ts` |
| payout | `VENDOR_INSTANT_PAYOUT_REQUESTED` | `services/marketplace/instant-payouts-service.ts` |
| marketplace_po | `MARKETPLACE_PO_CREATED` | `services/marketplace/checkout-service.ts` |
| payment | `MARKETPLACE_PAYMENT_INITIATED` | `services/marketplace/checkout-service.ts` |
| billing | `BILLING_PLAN_CHANGED` | `services/marketplace/billing-integration-service.ts` |
| terminal | `POS_TERMINAL_PAYMENT_*` | `app/api/pos/terminal/route.ts` |
| storefront | `STOREFRONT_PAYMENT_FAILED` | `services/storefront/storefront-payment-audit.ts` |
| storefront | `STOREFRONT_PAYMENT_RETRY_STARTED` | `services/storefront/storefront-payment-audit.ts` |
| cash | `POS_CASH_COUNTED` | `services/pos/pos-cash-count-service.ts` |

P3-79 extends P1-31 with marketplace payment, billing, terminal, storefront, and cash drawer audit coverage.

---

## Verify

```bash
npm run test:ci:money-actions-audit
npm run check:money-actions-audit-p3-79
npm run audit:money-actions-audit-p3-79
npm run test:ci:money-actions-audit-p3-79:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` (P3-79 cert audit)

---

## Status

All 14 money mutation surfaces emit structured audit logs via `auditLog` or `logPosTerminalControlEvent`.

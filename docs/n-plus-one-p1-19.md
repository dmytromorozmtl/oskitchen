# P1-19 — Remaining N+1 batch fixes (7 targets)

**Policy:** `p1-19-n-plus-one-batch-v1`  
**Registry:** [`artifacts/n-plus-one-p1-19.json`](../artifacts/n-plus-one-p1-19.json)

## Targets

| # | File | Batch pattern |
|---|------|---------------|
| 1 | `app/dashboard/training/assignments/page.tsx` | findMany lessons + progress by ID sets |
| 2 | `app/dashboard/growth/customer-success/page.tsx` | `computeCustomerHealthBatch` + `buildRetentionSummariesBatch` |
| 3 | `app/dashboard/growth/accounts/page.tsx` | `computeCustomerHealthBatch` |
| 4 | `app/dashboard/developer/flags/page.tsx` | `resolveAllFeaturesForUser` (single billing pass) |
| 5 | `actions/menus.ts` | findMany owned menus + transaction updateMany |
| 6 | `services/purchasing/bulk-price-service.ts` | findMany supplier items + single transaction |
| 7 | `services/franchise/franchise-service.ts` | `order.groupBy` for franchisee revenue |

## Verify

```bash
npm run check:n-plus-one-p1-19
npm run test:ci:n-plus-one-regression
```

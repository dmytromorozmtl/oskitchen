# P1-18 — Par levels auto-reorder N+1 batch fix

**Policy:** `p1-18-par-levels-auto-reorder-n1-v1`  
**Service:** [`services/inventory/par-levels-auto-reorder-service.ts`](../services/inventory/par-levels-auto-reorder-service.ts)  
**Registry:** [`artifacts/par-levels-auto-reorder-p1-18.json`](../artifacts/par-levels-auto-reorder-p1-18.json)

## Problem

`syncReorderQueueFromBelowParLevels` issued per-ingredient `findFirst` / `create` queries (N+1).  
`createDraftPurchaseOrdersFromReorderQueue` issued per-line `supplierItem.findFirst` (N+1).

## Fix

| Function | Before | After |
|----------|--------|-------|
| `syncReorderQueueFromBelowParLevels` | loop + findFirst/create | findMany (existing, suppliers, supplierItems) + createMany |
| `createDraftPurchaseOrdersFromReorderQueue` | loop + findFirst per line | findMany per supplier group + in-memory map |

## Verify

```bash
npm run check:par-levels-auto-reorder-p1-18
npm run check:par-levels-auto-reorder-p2-43
```

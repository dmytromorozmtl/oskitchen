# Par levels + auto-reorder — MarketMan parity (P2-43)

**Policy:** `par-levels-auto-reorder-p2-43-v1`  
**Department:** Inventory  
**Registry:** [`artifacts/par-levels-auto-reorder-p2-43-registry.json`](../artifacts/par-levels-auto-reorder-p2-43-registry.json)

---

## MarketMan parity scope

When on-hand stock falls below par, OS Kitchen surfaces replenishment in the reorder queue and can draft purchase orders grouped by supplier — buyer approval stays human-in-the-loop.

| Step | UI | Backend |
|------|-----|---------|
| **Sync par levels** | “Sync from par levels” on Purchasing + Reorder queue | `syncReorderQueueFromBelowParLevels()` |
| **Review queue** | `/dashboard/purchasing/reorder-queue` | Open `ReorderQueueItem` rows (`PAR_REPLENISHMENT`) |
| **Generate draft POs** | “Generate draft POs” button | `createDraftPurchaseOrdersFromReorderQueue()` |
| **Buyer approval** | Purchase order workflow | DRAFT PO → review → send |

> MarketMan parity — par level targets, auto-reorder queue, draft PO by supplier. No silent vendor sends.

---

## Routes

- **Reorder queue:** [`/dashboard/purchasing/reorder-queue`](/dashboard/purchasing/reorder-queue)
- **Purchasing overview:** [`/dashboard/purchasing`](/dashboard/purchasing)
- **Draft POs:** [`/dashboard/purchasing/purchase-orders`](/dashboard/purchasing/purchase-orders)

---

## Audit

```bash
npm run audit:par-levels-auto-reorder-p2-43
npm run check:par-levels-auto-reorder-p2-43
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` — Par levels auto-reorder P2-43 audit step.

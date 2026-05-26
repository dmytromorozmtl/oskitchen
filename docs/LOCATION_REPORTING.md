# Location reporting

## Cross-location

`/dashboard/locations/reports` shows a 30-day comparison table with the
following columns:

| Column | Source |
|--------|--------|
| Orders | `prisma.order.groupBy(["locationId"])` |
| Routes | `prisma.deliveryRoute.groupBy(["locationId"])` |
| Tasks | `prisma.kitchenTask.groupBy(["locationId"])` |

Unassigned rows are pinned at the bottom so they're easy to spot.

## Per-location

`/dashboard/locations/[id]/reports` shows a 30-day KPI strip:

- Orders + revenue (`order.aggregate(_sum: total)`)
- Production batches
- Delivery routes
- Tasks created / completed / completion rate
- Inventory shortages (`quantityOnHand <= 0`)

## Adding a location filter to existing reports

Other report pages can scope to the current switcher value without rewriting
queries:

```ts
import { locationContextFilter } from "@/lib/locations/location-context";

const where = {
  userId,
  ...(await locationContextFilter()),
};
```

This works for any model with `locationId` — Orders, Routes, Tasks,
InventoryStock, ProductionBatch, PackingBatch, PurchaseOrder.

## Reports that should adopt this next

- `/dashboard/reports` (top-line dashboard)
- `/dashboard/reports/enterprise` (already groupBy-by-status; can also add
  location filter)
- `/dashboard/executive` (board-room summary)
- `/dashboard/forecast`
- `/dashboard/costing`

The wiring is a one-liner per query — the filter helper composes cleanly.

# Purchase order workflow

- **List + new draft:** `/dashboard/purchasing/purchase-orders` — form picks `Supplier`, submits `createDraftPurchaseOrderAction` → redirects to detail.
- **Detail:** `/dashboard/purchasing/purchase-orders/[poId]` — totals, lines (when present), approval activity feed.
- **Statuses:** `PurchaseOrderStatus` enum (includes `OVERDUE` for explicit flag; UI also derives late sent POs in KPI heuristic).

Transitions (approve, send, cancel) and line CRUD are intentionally not faked — add with validation + audit rows.

# Reorder queue

- **Route:** `/dashboard/purchasing/reorder-queue`
- **Population:** Server action “Generate from demand” on Purchasing overview calls `seedReorderQueueFromDemandShortages` — inserts `OPEN` rows for live demand shortages (dedupes same ingredient + required-by date).
- **Fields:** `suggestedPurchaseQuantity` uses `lib/purchasing/reorder-rules.suggestReorderQuantity` (shortage vs par gap).

“Add to PO” batching from queue rows is the next wiring step.

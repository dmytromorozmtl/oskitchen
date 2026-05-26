# Performance

## Aggregation strategy

- We rely on Prisma `aggregate`, `groupBy`, and `count` over indexed
  `(userId, …)` columns wherever possible — the schema already has
  `Order.{userId, createdAt}`, `ProductionBatch.{userId, productionDate}`,
  `PackingBatch.{userId, packingDate}` (via wider indexes), `DeliveryRoute.{userId, routeDate}`,
  `CateringQuote.{userId, status, updatedAt}` family.
- The executive overview uses **one** `findMany` call to fetch enriched
  order rows (incl. small joins for storefront / external / meal plan /
  catering), then performs the breakdowns in-memory.
- Top-products uses `groupBy productId` with `_sum quantity` so we avoid
  pulling all order items.
- Delivery analytics groups stops by status after constraining to the
  route IDs in the window.

## Snapshots

- `analytics_snapshots` table is designed so owners can capture a
  full overview into a single row. The dashboard can later read snapshots
  instead of recomputing — useful for monthly reports.

## Future caching

- The current implementation does **not** add a Next.js `unstable_cache`
  layer; we prefer accurate live data and trust the Prisma query plans.
- Heavy reports should move to background workers; the snapshot model
  is the staging area for that future evolution.

## Pagination

- All tabular displays are bounded (`take: 25` / `take: 50`); CSV exports
  are bounded to 5,000 rows. Empty windows are handled gracefully.

## Avoided anti-patterns

- We never load entire `orders` or `order_items` tables.
- We never load full `kitchen_customers` rows to compute LTV — we use
  `aggregate` instead.
- We never run a query per row; all per-tab work is fixed in count.

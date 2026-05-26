# Executive reports

Two registry entries power the executive pack:

- `executive_weekly_summary`
- `executive_monthly_summary`

Both call `buildExecutiveSummary(ctx, cadence)` in
`services/reports/report-service.ts`. The function reads:

- `prisma.order` (with `orderItems.product`, `importedFromExternal`,
  `storefrontOrder`) — net revenue, AOV, repeat rate, top channel and
  top-products.
- `prisma.productionBatch` — production completion (completed items /
  total items).
- `prisma.packingBatch` — pack-through rate.
- `prisma.deliveryStop` — delivery on-time rate.
- `prisma.cateringQuote` — accepted catering revenue in window.

The runner produces 12 rows (window, net revenue, orders, AOV, repeat
rate, top channel, production completion, packing accuracy, delivery
on-time, catering accepted, top products, next recommendations).

`deriveRecommendations(...)` is a deterministic heuristic — it never
calls out to any model service and only suggests the operator review the
metric, e.g.:

- Cancellation rate &gt; 10% → "Investigate cancellation drivers".
- Production completion &lt; 90% → "Review production completion gaps".
- Packing rate &lt; 95% → "Audit packing exceptions".
- Delivery rate &lt; 90% → "Improve delivery on-time rate".
- Repeat rate &lt; 20% → "Run retention campaign for one-time customers".

All numbers are explainable from the raw data — no synthetic forecasts.

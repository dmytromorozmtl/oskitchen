# Executive dashboard — QA checklist

## Render

- [x] `/dashboard/executive` builds and renders without errors.
- [x] Subnav highlights the active tab (`Overview` is exact-match).
- [x] When the workspace has **no** orders / production / packing /
      delivery / brands / locations, the page shows the empty state
      CTA instead of `$0` cards.
- [x] When the workspace has data, all KPI cards render with a value
      (or `—` when null) and a drilldown link.

## KPIs

- [x] Net revenue excludes cancelled orders.
- [x] Order count includes all statuses.
- [x] AOV is `null` when there are zero orders.
- [x] Repeat rate uses email-keyed dedup via `computeRepeatRate`.
- [x] Top channel uses `channelForOrder` (storefront vs. integration vs. manual).
- [x] Production completion handles zero-item batches gracefully.
- [x] Packing accuracy handles zero `totalItems` gracefully.
- [x] Delivery completion handles zero stops gracefully.
- [x] Margin estimate is `null` when no costing run exists.
- [x] Inventory alerts only count open shortages with `shortageQuantity > 0`.

## Health score

- [x] Score caps at 100, never negative.
- [x] All deductions are explainable via `contributions` array.
- [x] Labelled "operational estimate" everywhere it appears.

## Insights

- [x] `deriveInsights` returns `all_clear` when no other rule fires.
- [x] `syncExecutiveInsights` resolves stale open insights of the same
      `type` instead of duplicating rows.
- [x] Manage actions enforce `executive.insights.manage`.

## Permissions

- [x] Roles without `executive.read.financial` cannot see revenue,
      AOV, margin, meal-plan recurring, catering pipeline, top
      channel, or purchasing KPI cards on the overview page.
- [x] `/profitability` returns a permission-denied card to roles
      without `executive.read.financial`.
- [x] `/customers` page shows the masked banner for roles without
      `executive.read.customer_pii`.
- [x] `/brands-locations` is gated by `executive.read.brand_location`.
- [x] `/report` is gated by `executive.export`.
- [x] Superadmin (`workspace.moroz@gmail.com`) sees everything.

## Empty / partial states

- [x] No production batches → production card shows `—`.
- [x] No packing batches → packing card shows `—`.
- [x] No delivery stops → delivery card shows `—`.
- [x] No brands → top brand card shows `—` with brand count.
- [x] No locations → top location card shows `—` with location count.
- [x] No costing run → margin card shows `—` plus a warning banner.

## Build

```bash
npm run typecheck
npm run build
```

Both must finish with `Exit code: 0`. See the final ready-report for
the recorded run.

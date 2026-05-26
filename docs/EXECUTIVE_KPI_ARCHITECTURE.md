# Executive KPI architecture

The Executive Command Center reads from existing analytics, costing,
packing, production, route, inventory, purchasing, catering, meal-plan,
and customer modules. There is **no** synthetic data. Each KPI is a
deterministic projection of rows we already store.

## Files

- `lib/executive/executive-kpis.ts` — definitions (label, source, period,
  comparison, permission, warning rules, drilldown route).
- `lib/executive/executive-permissions.ts` — granular gating used both by
  the UI and the report export.
- `lib/executive/executive-terminology.ts` — business-mode copy.
- `lib/executive/executive-health.ts` — health score (operational
  estimate, transparent point deductions).
- `lib/executive/executive-insights.ts` — pure rule engine that converts
  the overview snapshot into `ExecutiveInsight` seeds.
- `services/executive/executive-dashboard-service.ts` — single
  `loadExecutiveOverview(scope, filters)` API that all UI pages call.
- `actions/executive.ts` — server actions for snapshot refresh and
  insight management.

## KPI groups

| Group | KPIs |
|-------|------|
| Revenue | `revenue`, `average_order_value` |
| Orders | `orders` |
| Customers | `repeat_customers`, `new_customers` |
| Channels | `top_channel` |
| Production | `production_completion` |
| Packing | `packing_accuracy` |
| Delivery | `delivery_performance` |
| Margin | `margin_estimate` |
| Inventory | `inventory_alerts` |
| Purchasing | `purchasing_needs` |
| Tasks / Labor | `overdue_tasks` |
| Brands | `top_brand` |
| Locations | `top_location` |
| Catering | `catering_pipeline` |
| Meal Plans | `meal_plan_recurring` |

## KPI contract

Every KPI carries:

- `key`, `label`, `description`
- `source` — the table / function it's derived from
- `period` — `selected` (filter window), `rolling_7d`, or `rolling_30d`
- `comparison` — previous period / week / month, or `none`
- `requiredPermission` — `executive.read.financial` etc.
- `emptyState` — copy shown when the underlying data is empty
- `drilldownRoute` — module deep-link
- `warningRules` — human-readable thresholds that drive the insight engine
- `format` — `currency` / `number` / `percent` / `text`

## How values are produced

`loadExecutiveOverview` runs ~15 Prisma queries in parallel:

1. Orders in window (with channel attribution + product items).
2. Orders in **previous** window for comparison values.
3. Production batches (totals + completed items).
4. Packing batches (totals + packed items).
5. Delivery stops via route relation.
6. Latest costing run + profitability lines (median margin + at-risk items).
7. Ingredient demand open lines with shortage.
8. Open and stale purchase orders.
9. Overdue / open kitchen tasks.
10. Catering quotes + overdue follow-ups.
11. Active meal plans + cycles missing.
12. Failed / `NEEDS_AUTH` integration connections.
13. Brand and location revenue groupBy.
14. Brand / location counts.
15. New customer count (`firstOrderAt` in window).

Every numeric reduction (`netRevenue`, `repeatRate`, `marginMedian`)
calls a deterministic helper. Where data is missing we return `null`
and render `—`, never `0`.

## Comparison logic

`shiftToPreviousPeriod(filters)` from `lib/analytics/filters` shifts the
window by its own length. `pct(current, previous)` returns:

- `null` when either side is `null` or when previous is 0 and current
  is not (we can't compute a meaningful percentage),
- `0` when both are 0,
- otherwise `(current - previous) / |previous|`.

The KPI card colours are emerald for the desired direction and rose
otherwise. `overdue_tasks` and `inventory_alerts` invert the colour so
that "down" is good.

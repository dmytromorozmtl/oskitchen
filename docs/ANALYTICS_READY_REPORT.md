# Analytics ready report

## What changed

- Replaced the placeholder `/dashboard/analytics` page with a fully wired
  **Operational Intelligence & Executive Analytics Center**.
- Added 12 sub-routes under `/dashboard/analytics/*` covering Executive
  Overview, Revenue, Orders, Channels, Customers, Production,
  Packing & Delivery, Catering, Meal Plans, Inventory & Margin,
  Forecasting, Reports, and Saved Views.
- Created `lib/analytics/*` (9 modules) and `services/analytics/*` (6 modules).
- Added the `actions/analytics.ts` server actions (snapshot, saved-view CRUD, alert toggle, CSV export).
- Added 4 additive Prisma tables: `analytics_snapshots`, `analytics_events`, `analytics_saved_views`, `analytics_alerts` (with two enums and indexes).

## Analytics architecture

See `docs/ANALYTICS_ARCHITECTURE.md`. Layered as
`lib/analytics → services/analytics → actions/analytics → app/dashboard/analytics`.

## KPIs

17 canonical KPIs catalogued in `lib/analytics/kpi-definitions.ts`. Every
KPI references a formula referencing only real KitchenOS data — no
synthetic numbers.

## Dashboards

| Tab | Highlights |
|-----|-----------|
| Executive Overview | 14 KPI cards, revenue trend, channel mix, fulfillment mix, top products. |
| Revenue | Gross / net / cancelled, daily revenue, channel & product breakdowns. |
| Orders | Volume, cancellations, fulfillment mix, hourly + day-of-week heatmaps. |
| Channels | Per-channel revenue and detail with attribution notes. |
| Customers | Repeat rate, top spenders (masked), VIP LTV. |
| Production | Items planned/completed, station load, recent batches. |
| Packing & Delivery | Completion rates, stops by status. |
| Catering | Pipeline, accepted, conversion, by event type. |
| Meal Plans | Active/paused/cancelled plans + recurring revenue + cycles. |
| Inventory & Margin | Real counts only (no fabricated food cost percentages). |
| Forecasting | Trailing 90d history + 14d moving-average forecast, clearly labelled estimate. |
| Reports | Nine print/CSV-friendly reports. |
| Saved Views | Persistable named filter sets + presets. |

## Filters

URL-driven, parsed by `parseAnalyticsFilters`: range, channel, brand,
location, fulfillment, meal-plan-only, catering-only.

## Forecasting

Documented in `docs/ANALYTICS_FORECASTING.md`. Returns `null` when there's
less than 7 days of dense history — UI displays an "insufficient history"
card. Forecast labels are explicit.

## Alerts

Documented in `docs/ANALYTICS_ALERTS.md`. Five live rules + four reserved
rule slots. Triggered alerts persist a `lastTriggered` and an event row
for the audit trail.

## Reports

Nine CSV-backed reports. Every cell is formula-injection safe; emails in
the orders CSV are masked.

## Permissions

`canDoAnalytics(scope, permission)` enforces role-based visibility. Owners
always have full access. Superadmin (`workspace.moroz@gmail.com`) is
always allowed.

## Performance optimisations

- Single `findMany` for the executive overview's order rows.
- `groupBy` / `aggregate` for top products, delivery stops, catering totals.
- All tabular UI is bounded (`take: 25` or `take: 50`).
- CSV exports bounded to 5,000 rows.
- `analytics_snapshots` table reserved for capturing dense KPI rows.

## Remaining limitations

- Inventory tab currently surfaces counts only; food cost % is intentionally
  not synthesised. A future iteration can compute it from `costing` data.
- Forecasting is a single moving-average baseline. Recurring meal-plan and
  catering contributions are wired in `addRecurringContribution` but not
  yet layered into the UI.
- Alerts are persisted but only evaluated on demand via `evaluateAnalyticsAlerts`;
  a scheduled trigger is a future iteration.
- PDF report export is a placeholder.

## Next recommendations

- Surface evaluated alerts inline on the executive overview.
- Add a small client charting library (Recharts) once we adopt one app-wide.
- Drive the snapshot cadence from a scheduled worker to power historical
  comparisons (e.g. "last 7 days vs the same 7 days last year").
- Connect Costing & Margin module so the Inventory tab can show food cost %.

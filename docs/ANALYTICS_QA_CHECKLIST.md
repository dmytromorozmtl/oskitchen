# Analytics QA checklist

- [x] `/dashboard/analytics` renders for workspaces with orders.
- [x] Empty state renders cleanly when there are no orders or external rows.
- [x] Filters (range, channel, brand, location, fulfillment, meal-plan-only, catering-only) update KPIs and charts.
- [x] Channel mix never double-counts an imported order.
- [x] Revenue excludes CANCELLED orders.
- [x] Catering revenue equals `SUM(catering_quotes.total WHERE status IN (ACCEPTED, CONVERTED_TO_ORDER))` for the window.
- [x] Production / packing rates fall back to "—" when totals are zero (no NaN).
- [x] Customer emails in the top spenders list are masked.
- [x] Forecast page surfaces the insufficient-history card when applicable.
- [x] CSV exports escape leading `=`, `+`, `-`, `@`.
- [x] Saved views persist and can be deleted.
- [x] Snapshot generation writes an `analytics_events` row.
- [x] `npm run typecheck` passes.
- [x] `npm run build` passes.
- [x] Superadmin email (`workspace.moroz@gmail.com`) is allowed by `canDoAnalytics`.

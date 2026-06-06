# Analytics Suite setup (Era 200)

Era 200 certifies Analytics Suite wiring (Round 2): all restaurant metrics on one screen with drill-down links — with canonical proof via era125 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/analytics/analytics-suite-service.ts` | Aggregates executive, orders, customers, ops, forecast |
| `lib/analytics/analytics-suite-builders.ts` | Metric, lane, snapshot builders |
| `lib/analytics/analytics-suite-policy.ts` | Policy id, route, default window |
| `app/dashboard/analytics/suite/page.tsx` | Analytics Suite dashboard page |
| `components/analytics/analytics-suite-panel.tsx` | Summary cards + eight metric lanes |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:analytics-suite-era200` | Full era200 cert + wiring audit |
| `npm run test:ci:analytics-suite-era200` | Era200 + era125 + analytics suite unit tests |
| `npm run test:ci:analytics-suite-era200:cert` | Wiring cert only (CI gate) |
| `npm run smoke:analytics-suite-era125` | Canonical era125 smoke |

## Human activation

1. Open **Dashboard → Analytics → Analytics Suite**.
2. Review **summary cards** — Metric lanes, Total metrics, Warnings.
3. Inspect **eight lanes** — Revenue, Orders, Customers, Operations, Catering, Meal Plans, Inventory, Forecast.
4. Use **Drill down** links on metrics for detailed pages.
5. Run `npm run smoke:analytics-suite-era200` — artifact **PASSED**.

## Lanes

| Lane | Metrics source |
|------|----------------|
| `revenue` | Executive overview — gross, AOV, top channel/brand |
| `orders` | Order analytics — count, cancellation, fulfillment |
| `customers` | Customer analytics — active, repeat, VIP |
| `operations` | Production, packing, delivery completion |
| `catering` | Catering quotes and pipeline |
| `meal_plans` | Active plans and recurring orders |
| `inventory` | Ingredients, recipes, demand lines |
| `forecast` | Forecasting 2.0 90-day projection |

## Artifact

Summary written to `artifacts/analytics-suite-era200-smoke-summary.json` (gitignored).

See also: [analytics-suite-era125-setup.md](./analytics-suite-era125-setup.md)

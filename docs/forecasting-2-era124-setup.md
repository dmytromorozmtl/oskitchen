# Forecasting 2.0 smoke setup (Era 124)

Era 124 certifies Forecasting 2.0 wiring: 90-day demand projection with weather and holiday adjustments.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/ai/forecasting.ts` | Order history loader + snapshot builder |
| `lib/ai/forecasting-builders.ts` | Daily points, series, holiday/weather multipliers |
| `lib/ai/forecasting-policy.ts` | Policy id, route, 90-day horizon/history |
| `app/dashboard/forecast/forecasting-2/page.tsx` | Forecasting 2.0 dashboard page |
| `components/ai/forecasting-2-panel.tsx` | Summary cards, holidays, weather, 30-day table |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:forecasting-2-era124` | Full era124 cert + wiring audit |
| `npm run test:ci:forecasting-2-era124` | Era124 + forecasting 2.0 unit tests |
| `npm run test:ci:forecasting-2-era124:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Forecast → Forecasting 2.0**.
2. Review **summary cards** — 90-day orders/revenue, confidence, uplift days.
3. Check **Upcoming holidays** and **Weather adjustments** sections.
4. Inspect **Next 30 days** table — orders, revenue, weather, events.
5. Run `npm run smoke:forecasting-2-era124` — artifact **PASSED**.

## Signals

| Signal | Source |
|--------|--------|
| `90-day` | Trailing history → 90-day forward projection |
| `weather` | Deterministic weather proxy multipliers |
| `holidays` | Holiday calendar windows with boost factors |

## Artifact

Summary written to `artifacts/forecasting-2-smoke-summary.json` (gitignored).

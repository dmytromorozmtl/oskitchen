# Forecasting 2.0 setup (Era 199)

Era 199 certifies Forecasting 2.0 wiring (Round 2): 90-day demand projection with weather and holiday adjustments — with canonical proof via era124 live smoke.

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
| `npm run smoke:forecasting-2-era199` | Full era199 cert + wiring audit |
| `npm run test:ci:forecasting-2-era199` | Era199 + era124 + forecasting 2.0 unit tests |
| `npm run test:ci:forecasting-2-era199:cert` | Wiring cert only (CI gate) |
| `npm run smoke:forecasting-2-era124` | Canonical era124 smoke |

## Human activation

1. Open **Dashboard → Forecast → Forecasting 2.0**.
2. Review **summary cards** — 90-day orders/revenue, confidence, uplift days.
3. Check **Upcoming holidays** and **Weather adjustments** sections.
4. Inspect **Next 30 days** table — orders, revenue, weather, events.
5. Run `npm run smoke:forecasting-2-era199` — artifact **PASSED**.

## Signals

| Signal | Source |
|--------|--------|
| `90-day` | Trailing history → 90-day forward projection |
| `weather` | Deterministic weather proxy multipliers |
| `holidays` | Holiday calendar windows with boost factors |

## Artifact

Summary written to `artifacts/forecasting-2-era199-smoke-summary.json` (gitignored).

See also: [forecasting-2-era124-setup.md](./forecasting-2-era124-setup.md)

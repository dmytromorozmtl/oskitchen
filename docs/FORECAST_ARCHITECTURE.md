# Forecast architecture

## Layered design

```
app/dashboard/forecast/*                — Next.js routes (Server Components)
   │
   ▼
components/dashboard/forecast-subnav   — Top-level navigation
   │
   ▼
actions/forecast.ts                     — Server actions (run, adjust, send)
   │
   ▼
services/forecast/forecast-service.ts   — Calculation, expansion, adjustments, downstream actions
   │
   ▼
lib/forecast/*                          — Pure helpers (no Prisma)
   │
   ▼
prisma (Order, OrderItem, Menu, Product, MealPlanCycle, CateringQuote,
         CateringQuoteItem, ProductionBatch, IngredientDemandRun,
         Recipe, RecipeIngredient, Ingredient, ForecastRun/Line/Adjustment/Event)
```

## Files

| Layer | Path | Purpose |
|-------|------|---------|
| lib | `lib/forecast/forecast-types.ts` | `ForecastType` + `ForecastSourceType` labels and business-mode terminology. |
| lib | `lib/forecast/forecast-sources.ts` | `ForecastSourceContribution` + `mergeContributions`. |
| lib | `lib/forecast/forecast-calculations.ts` | `simpleMovingAverage`, `sameWeekdayAverage`, `applyBuffer`, `roundUpUnit`, `combineContributions`. |
| lib | `lib/forecast/forecast-confidence.ts` | `deriveConfidence` per line, `deriveRunConfidence` per run. |
| lib | `lib/forecast/forecast-buffers.ts` | Business-mode default buffer + clamp. |
| lib | `lib/forecast/forecast-permissions.ts` | `canDoForecast` + superadmin override. |
| service | `services/forecast/forecast-service.ts` | Orchestration, line construction, ingredient expansion, send to production / demand, archive / restore. |
| action | `actions/forecast.ts` | Run, adjust, send to production, send to demand, archive, restore. |
| UI | `app/dashboard/forecast/page.tsx` | Command Center. |
| UI | `app/dashboard/forecast/new/page.tsx` | Run wizard. |
| UI | `app/dashboard/forecast/[runId]/page.tsx` | Run detail (product/catering/ingredient views, adjustments, actions). |
| UI | `app/dashboard/forecast/history/page.tsx` | Run history. |
| UI | `app/dashboard/forecast/settings/page.tsx` | Settings & guidance. |

## Tables

- `forecast_runs` — one row per run, with brand/location/forecast type, date window, sources JSON, buffer %, confidence, status.
- `forecast_lines` — one row per forecasted product / ingredient / free-text line, with forecast / buffer / recommended quantity and `source_summary_json` describing contributions.
- `forecast_adjustments` — audited operator overrides (PERCENT / FIXED_QUANTITY / OVERRIDE).
- `forecast_events` — audit log (run created/completed, adjustment added, sent to production / demand, archived / restored).

All four tables cascade on `users.id`, and `forecast_runs.brand_id` / `forecast_runs.location_id` use `ON DELETE SET NULL` so deleting a brand or location never destroys history.

# Forecast ready report

## What changed

- Replaced the single-screen `/dashboard/forecast` page with a full
  **Forecast & Planning Center** including overview, wizard, run detail,
  history, and settings.
- Added 6 helper modules under `lib/forecast/*` and 1 service under
  `services/forecast/*`.
- Added 4 additive Prisma tables: `forecast_runs`, `forecast_lines`,
  `forecast_adjustments`, `forecast_events`, plus 6 enums and indexes.
  All existing forecast code (`services/forecasting/production-forecast.ts`)
  remains intact and untouched.

## Forecast sources

- `HISTORICAL_ORDERS`, `SALES_CHANNELS` — trailing 90 days, same-weekday averaging.
- `ACTIVE_MENU`, `UPCOMING_MENU`, `MENU_PLANNER` — enrich product list with current/future menu items.
- `MEAL_PLANS` — committed plate counts from upcoming meal plan cycles.
- `ACCEPTED_CATERING_EVENTS` — accepted/converted catering quote items.
- `PRODUCTION_PLAN` — internal source tag for ingredient expansion.
- `MANUAL_ADJUSTMENT` — operator-supplied PERCENT / FIXED_QUANTITY / OVERRIDE.
- `SEASONAL_FACTOR` — reserved for future seasonal multipliers.

## Calculation methods

1. Same-weekday average (with simple moving average fallback).
2. Menu enrichment (no demand inferred, list-only).
3. Meal-plan committed demand (`selection.quantity × servingsPerMeal`).
4. Catering accepted-event demand.
5. Manual adjustment (PERCENT / FIXED_QUANTITY / OVERRIDE).
6. Buffer application (`ceil(qty × buffer% / 100)`).
7. Ingredient expansion via active recipes with waste percent.

## Confidence levels

- `LOW`, `MEDIUM`, `HIGH`, `MANUAL`. Detailed rules in `docs/FORECAST_CONFIDENCE.md`.

## Buffers

Per-business defaults (Bakery 12%, Bar 8%, Catering 15%, Meal Prep 10%,
Restaurant/Café 8%, Ghost/Multi 12%); overridable per run. Always
rounds **up**. `roundUpUnit` helper available for bakery batch sizes.

## Business modes

`forecastTerminologyForMode` adapts page title and default sources for:
Restaurant, Café, Bar, Bakery, Catering, Meal Prep, Ghost / Multi-Brand.
Empty states are gated by mode — only Meal Prep nudges to set an active
weekly menu, and that nudge never blocks the page.

## Production integration

`sendForecastToProduction` creates a draft `ProductionBatch`. Operators
review and confirm inside the Production Command Center.

## Ingredient Demand integration

`sendForecastToIngredientDemand` expands forecasted products via active
recipes, computes honest shortage quantities against `currentStock`,
and creates a draft `IngredientDemandRun`.

## Permissions

`lib/forecast/forecast-permissions.ts:canDoForecast` enforces:
- owner / admin: full access.
- manager: run / adjust / settings.
- kitchen lead: read + send to production.
- purchasing: read + send to ingredient demand.
- viewer / sales / staff roles: read-only.
- superadmin `workspace.moroz@gmail.com`: bypass.

## Remaining limitations

- Channel-only forecasting (`CHANNEL_DEMAND`) uses the same engine as
  product demand with channel/fulfillment filters; per-channel
  scenarios live on the roadmap.
- Pipeline catering quotes are excluded by default; a "scenario only"
  toggle is the next iteration.
- Forecast-vs-actual reporting is intentionally **not faked** when
  enough completed runs exist we'll compute and display it.
- Per-product and per-category buffer rules are modelled but not yet
  surfaced in the UI.
- Recurring scheduled runs (cron) are not implemented; runs are
  on-demand today.

## Next recommendations

- Add per-product buffer rules to the settings page and apply them
  during line construction.
- Build a scheduled job that runs a "Daily ops" forecast each morning.
- Add forecast-vs-actual once a stable matching key (date + product)
  exists across runs and orders.
- Optionally allow pipeline catering quotes as a low-confidence
  scenario in the wizard.

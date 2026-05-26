# Forecast sources

| Source | Pulled from | What it contributes |
|--------|-------------|---------------------|
| `HISTORICAL_ORDERS` | `orders` + `order_items` for the trailing 90 days, excluding `CANCELLED` | A per-product daily series used for same-weekday averaging. |
| `ACTIVE_MENU` | `menus` where `active = true` and `catalog_only = false` | Lists products of the active menu — even with zero history — so operators see the full picture. |
| `UPCOMING_MENU` | Menus whose `start_date >= now` | Future menus add their products with a "no demand signal yet" note. |
| `MENU_PLANNER` | Same menus as above; reserved for richer Menu Planner integration. | Stub today — keeps the data model open for planner-driven additions. |
| `MEAL_PLANS` | `meal_plan_cycles` with `status IN (UPCOMING, NEEDS_SELECTION, READY_TO_GENERATE)` and `cycle_start_date` in window, joined to selections × `servings_per_meal` | Committed recurring demand. |
| `ACCEPTED_CATERING_EVENTS` | `catering_quotes` with `status IN (ACCEPTED, CONVERTED_TO_ORDER)` and `event_date` in window, joined to `catering_quote_items` | Event-driven additive demand. |
| `PRODUCTION_PLAN` | Internal source used during ingredient expansion. | Marks ingredient lines as derived from planned production. |
| `SALES_CHANNELS` | Equivalent to `HISTORICAL_ORDERS` filtered through channel/fulfillment filters | Used for channel-specific scenarios. |
| `MANUAL_ADJUSTMENT` | `forecast_adjustments` rows | PERCENT / FIXED_QUANTITY / OVERRIDE deltas tracked with reason. |
| `SEASONAL_FACTOR` | Reserved | No-op today; data model is ready for seasonal multipliers. |

## Per-product breakdown

`forecast_lines.source_summary_json` carries a `ForecastSourceContribution[]`
with the source, signed quantity, and an optional note. The run-detail UI
surfaces this as the "Sources" column so operators understand which inputs
drove a number.

## De-duplication

Catering accepted-event items linked to a product are folded into that
product's accumulator. Catering items without a product become free-text
lines, keyed by `catering:<quoteId>:<title>` so each is unique in the run.

# Forecast → Ingredient Demand integration

A completed forecast run can be expanded into a draft Ingredient
Demand run so purchasing can react.

## Server action

`actions/forecast.ts:sendForecastToIngredientDemandAction` →
`services/forecast/forecast-service.ts:sendForecastToIngredientDemand`.

Inputs (via form): `forecastRunId`, `title`.

## What happens

1. Assert ownership.
2. If the forecast already has ingredient-level lines, reuse them; otherwise expand product lines using `expandToIngredientLines`. This uses each product's active `recipes` row and applies waste percent.
3. Pull each ingredient's `currentStock` to compute `shortageQuantity = max(0, required - stock)` honestly — `shortageQuantity` is `null` when stock isn't tracked.
4. Create an `IngredientDemandRun` in `DRAFT` status with `dateFrom / dateTo` copied from the forecast run, `filterBrandId / filterLocationId` copied, `sourceTypesJson = ["FORECAST_RUN"]`.
5. Create `IngredientDemandRunLine` rows in bulk and update `shortageLines` count on the parent run.
6. Emit a `SENT_TO_INGREDIENT_DEMAND` event with `demandRunId` and `shortageCount`.

## What we deliberately do not do

- We don't lock the demand run — operators can review and edit in Ingredient Demand.
- We don't auto-create purchase orders.
- We don't synthesise costs.

## Permission gate

`canDoForecast(scope, "forecast.send_to_demand")` — limited to
manager / admin / purchasing; superadmin override applies.

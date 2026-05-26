# Forecast → Production integration

The Forecast & Planning Center can hand a completed run to the
existing Production Command Center.

## Server action

`actions/forecast.ts:sendForecastToProductionAction` →
`services/forecast/forecast-service.ts:sendForecastToProduction`.

Inputs (via form): `forecastRunId`, `title`, `productionDate`.

## What happens

1. We assert ownership of the forecast run.
2. Pull the top 200 product lines (descending recommended quantity).
3. Compute `totalItems = sum(round(recommendedQuantity))`.
4. Create a `ProductionBatch` row in `DRAFT` status with:
   - `mode = DAILY_PREP`
   - `sourceType = MANUAL`
   - `brandId / locationId` copied from the forecast run
   - `notes` linking back to the run title
5. Record a `forecast_events` row with `eventType = SENT_TO_PRODUCTION` plus `batchId` and `totalItems`.

## What we deliberately do not do

- We don't auto-confirm or auto-start the batch — operators still review.
- We don't allocate stations.
- We don't push individual production work items; operators can decompose the batch inside Production Command Center.
- We don't break any existing production flows: the new code only writes additional rows.

## Permission gate

`canDoForecast(scope, "forecast.send_to_production")` — limited to
manager / admin / kitchen_lead; superadmin override applies.

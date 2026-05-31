# Forecasting

OS Kitchen forecasting is **explicit and explainable**. We do not use
opaque models, do not invent numbers, and do not surface a forecast
when there isn't enough history.

## Algorithm

`lib/analytics/forecasting.ts` exposes a `movingAverage(series, daysAhead, window=14)`
helper that:

1. Requires at least 7 days of dense daily history.
2. Computes the trailing window-day mean.
3. Projects the mean forward `daysAhead` days.

## Inputs

`services/analytics/forecast-service.ts` loads the last 90 days of
revenue-eligible orders, densifies into a daily series, then runs the
moving average for the next 14 days.

## UI

The forecasting page shows:

- **Insufficient history** card when there are fewer than 7 days of data.
- **Revenue history (last 90d)** area chart.
- **Estimated revenue (next 14d)** area chart with a card description
  that clearly labels the projection as an estimate.

## Future extension hooks

- `addRecurringContribution` exists in `lib/analytics/forecasting.ts` so
  meal plan cycles and accepted catering events can be layered on top
  of the moving-average baseline once those data shapes are ready to
  drive expected daily revenue.

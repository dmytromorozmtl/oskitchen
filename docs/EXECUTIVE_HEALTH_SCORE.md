# Business health score

> **This is an operational health estimate, not an accounting statement
> and not an ML prediction.** Every point that comes off the score is
> labelled, deterministic, and tied to a row your workspace already
> stores.

Implementation: `lib/executive/executive-health.ts`.

## Inputs

`HealthInputs` is a plain object with the following fields, all derived
from `loadExecutiveOverview`:

- `revenueTrend` — `(current − previous) / |previous|` for the selected window.
- `orderTrend` — same for order count.
- `overdueProductionItems` — production items in window not yet completed.
- `packingAccuracy` — packed ÷ total in window.
- `failedDeliveries` — count of `DeliveryStop.status = FAILED` in window.
- `marginMedian` — median `grossMarginPercent` from the latest costing run, divided by 100 (so 0.62 means 62%).
- `marginAtRiskItems` — profitability lines with `warningLevel` ∈ {MEDIUM, HIGH} or food-cost % ≥ 40.
- `inventoryShortages` — open `IngredientDemandRunLine` rows with shortage > 0.
- `overdueTasks` — `KitchenTask.dueAt < now` and not done.
- `failedIntegrations` — integration connections in `NEEDS_AUTH` or `ERROR`.
- `repeatRate` — `computeRepeatRate` over the window's order list.

## Deductions

Starting from 100, each signal can take points off (max in parens):

- Revenue trend down — `clamp(|trend| × 25, 0, 25)`.
- Order trend down — `clamp(|trend| × 15, 0, 15)`.
- Overdue production items — `clamp(count × 2, 0, 15)`.
- Packing accuracy below 95% — `clamp((0.95 − rate) × 200, 0, 10)`.
- Failed delivery stops — `clamp(count × 3, 0, 10)`.
- Median margin below 50% — `clamp((0.5 − median) × 40, 0, 10)`.
- Items below margin target — `clamp(count, 0, 5)`.
- Inventory shortages — `clamp(count, 0, 10)`.
- Overdue tasks — `clamp(count × 1.5, 0, 10)`.
- Failed integrations — `clamp(count × 5, 0, 10)`.
- Low repeat rate (< 20%) — `clamp((0.2 − rate) × 25, 0, 5)`.

## Status bands

- `Healthy` ≥ 85
- `Watch` ≥ 70
- `At Risk` ≥ 50
- `Critical` otherwise

## Output

```
{
  score: 87,
  status: "Healthy",
  explanation: "3 signals pulling the score down. ...",
  contributions: [
    { key: "packing", label: "Packing accuracy", deduction: 5,
      reason: "Pack-through rate is 92.5% (target ≥ 95%)." },
    ...
  ]
}
```

The first 3 contributions are displayed under the score card so an
owner immediately knows *why* the score moved.

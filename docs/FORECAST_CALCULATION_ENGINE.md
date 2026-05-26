# Forecast calculation engine

The engine is deterministic, explainable, and free of ML/AI.

## Steps

1. **Resolve buffer** — start from per-business default (`bufferDefaultForMode`), allow run-level override. Clamp `0–100`.
2. **Persist run** — write a `forecast_runs` row in `DRAFT` status and emit a `RUN_CREATED` event.
3. **Build product accumulator** — sources are processed in order, each adding `ForecastSourceContribution` entries keyed by product id (or a synthetic `catering:<quoteId>:<title>` key for orphan catering lines).
4. **Project history** — for `HISTORICAL_ORDERS` / `SALES_CHANNELS`, fetch trailing 90 days, build a daily series per product, project forward using **same-weekday average** with **simple moving average** fallback. Sum per day across the requested window. Notes mark thin history.
5. **Layer committed demand** — `MEAL_PLANS` add committed quantities (`selection.quantity × servingsPerMeal`). `ACCEPTED_CATERING_EVENTS` add accepted quote item quantities.
6. **Combine contributions** — `combineContributions` sums positive and negative deltas, clamped to zero.
7. **Confidence** — `deriveConfidence({ historyDataPoints, hasMealPlanContribution, hasCateringContribution })` returns `LOW` / `MEDIUM` / `HIGH`. `MANUAL` is reserved for OVERRIDE adjustments.
8. **Buffer & recommend** — `bufferQuantity = ceil(quantity × bufferPercent / 100)`; `recommendedQuantity = quantity + buffer`.
9. **Sort & cap** — descending by recommended quantity, capped at 250 product lines.
10. **Ingredient expansion** (for `INGREDIENT_DEMAND` runs only) — for each product line we look up its active `recipes` row and multiply each `RecipeIngredient.quantity × (1 + wastePercent / 100)` by `recommended / yieldQuantity`. Per-ingredient buckets are produced and capped at 500 lines.
11. **Run confidence** — set to the **most frequent** line confidence so the run summary is honest.
12. **Mark COMPLETED** — emits `RUN_COMPLETED` event with `lineCount` and `confidence`.

## Adjustments

`addForecastAdjustment` is idempotent and audited.

- **PERCENT** — multiplies forecast quantity by `(1 + value/100)`.
- **FIXED_QUANTITY** — adds `value` to forecast quantity (can be negative).
- **OVERRIDE** — replaces forecast quantity with `value` and sets line confidence to `MANUAL`.

After the math we recompute `bufferQuantity` and `recommendedQuantity` and
append a `MANUAL_ADJUSTMENT` contribution to `source_summary_json`. The
`ADJUSTMENT_ADDED` event captures `targetType`, `targetId`, `adjustmentType`, and `value`.

## Downstream actions

- **sendForecastToProduction** — creates a `ProductionBatch` in `DRAFT` status with `totalItems = sum(recommendedQuantity)` rounded. Notes link back to the run.
- **sendForecastToIngredientDemand** — ensures ingredient lines exist (expanding on-the-fly if the run isn't an INGREDIENT_DEMAND run), then creates an `IngredientDemandRun` in `DRAFT` with `IngredientDemandRunLine` rows. Joins each ingredient's current stock to compute `shortageQuantity` honestly (never invented).

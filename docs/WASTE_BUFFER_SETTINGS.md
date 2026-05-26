# Waste buffer settings

Stored at `kitchen_settings.ingredient_demand_settings_json`.

## Shape (TypeScript)

- `globalWasteBufferPercent: number` — default kitchen buffer (still defaults to **5** until changed).
- `ingredientWasteBufferPercentById: Record<string, number>` — per-ingredient override **replacing** global for that SKU in math.
- `batchRounding: "none" | "ceil" | "floor"`.
- `enabledSources: Partial<Record<DemandSourceType, { enabled: boolean; confidence: number }>>`.

## UI

`/dashboard/inventory/demand/settings` edits global buffer, rounding, and source toggles.

Per-ingredient buffers should be edited via ingredient admin (future) or raw JSON for power users.

## Business modes

`loadIngredientDemandSettingsForUser` lightly biases defaults using `kitchen_settings.business_type` against `DEMAND_SOURCE_CATALOG.relevantBusinessTypes`.

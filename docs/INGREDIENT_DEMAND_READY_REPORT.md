# Ingredient demand — ready report

## What changed

- **Route preserved:** `/dashboard/inventory/demand` remains the hub; UI upgraded to a command center (tabs, KPIs, filters, warnings).
- **Settings route added:** `/dashboard/inventory/demand/settings` for waste buffer + source toggles (JSON on `kitchen_settings`).
- **Engine modularized:** `lib/ingredient-demand/*` + `services/ingredient-demand/demand-service.ts`.
- **Demand sources:** Confirmed/draft/storefront orders + production plan implemented; other sources stubbed with informational warnings when enabled.
- **Waste buffer:** No longer hardcoded in UI copy; defaults still 5% until changed in settings JSON.
- **Unit conversion:** Explicit conversions only; mass/volume families supported; cross-family requires `conversionJson`.
- **Purchasing:** Still uses the same rollup function; description mentions production lines; optional `demandRun` query banner.
- **Persistence:** `IngredientDemandRun` / `IngredientDemandRunLine` capture saved calculations.
- **Additive schema:** Ingredients, recipes, stock lots, substitutions extended without deleting legacy demand tables.

## Database

Apply migration `20260507191500_ingredient_demand_command_center` (`npm run db:deploy` or `prisma migrate dev`). Until then, Prisma queries selecting `ingredient_demand_settings_json` will error against old databases.

## Remaining limitations

- Stub sources (forecast, catering, manual plan, etc.) need real data pipelines.
- Production UI does not yet deep-link into demand runs.
- Substitution UI lists UUIDs until ingredient pickers are wired.
- Stock aggregation across locations ignores mismatched units instead of converting.

## Next recommendations

1. Store per-line `sourceSummaryJson` during persistence (batch/order IDs already available in contributions — extend mapper).
2. Product-level rollup should show human titles, not only IDs.
3. Role-based actions (purchasing vs chef) + audit log entries on run/save/export.
4. Streaming CSV for extremely large tenants.

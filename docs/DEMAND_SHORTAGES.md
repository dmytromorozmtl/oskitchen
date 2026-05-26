# Demand shortages

`lib/ingredient-demand/demand-grouping.classifyShortages`:

- `MISSING_CONVERSION` when `conversionRequired`.
- `NO_SUPPLIER` / `MISSING_COST` / `BELOW_STOCK` when numeric shortage > 0 (heuristic prioritization for purchasing follow-up).

The **Shortages** tab lists these rows for quick triage.

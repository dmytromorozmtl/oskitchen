# Margin rules

## Kitchen defaults (`costingSettingsJson`)

- `targetMarginPercent` / `warningMarginPercent` (0–100).  
- Optional `foodCostTargetPercent` (informational warning when food cost % exceeds target).

## `MarginRule` table

Optional per–business-mode overrides. `resolveMarginThresholds` picks the **most specific** active rule matching `businessMode` and optional `productType`, else falls back to kitchen defaults.

## Warning levels

`evaluateProfitabilityWarning` maps margin + food-cost breaches to `ProfitabilityWarningLevel` (`NONE` … `HIGH`) and human-readable JSON reasons.

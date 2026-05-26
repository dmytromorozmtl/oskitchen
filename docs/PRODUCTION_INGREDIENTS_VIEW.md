# Production ingredients view

**Route:** `/dashboard/production?view=ingredients`

## Goal

Roll up ingredient demand from work items → products → recipes; compare to on-hand stock; flag shortages and missing recipes.

## Current

Placeholder only.

## Integration points

- `Recipe` / `Ingredient` models (user scoped).
- Purchasing module links for PO drafts.
- Export CSV for supplier rounds.

## Actions (planned)

- Generate purchase list
- Open recipe/costing
- Export ingredient demand for date range

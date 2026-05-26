# AvT report foundation

## Routes

- `/dashboard/costing/avt` (Plan-gated costing feature)
- Subnav link: `AvT foundation`

## Behavior

- Workspace confidence card reuses `summarizeActualVsTheoretical`.
- Rows: group `order_items` by `product_id` for the date window; join active recipes + ingredient costs (supplier price history fallback).
- Variance copy only appears when workspace confidence is HIGH — still labeled as non-accounting truth.
- Filters (querystring): `from`, `to`, `brandId`, `locationId`, `category`, `confidence`.

## Files

- `services/costing/avt-report-service.ts`
- `components/costing/avt-confidence-card.tsx`
- `components/costing/recipe-coverage-card.tsx`
- `components/costing/avt-report-table.tsx`

# Brand reporting

**Route:** `/dashboard/brands/[brandId]/reports`

## Implemented

- Rolling **30-day** and **7-day** revenue sums (`Order.total`) for orders with matching `brandId`.  
- **Top items** via `OrderItem` `groupBy` `productId` filtered through parent order brand (quantity sum).

## Planned executive views

- Margin, channel performance, storefront conversion — requires cost + session telemetry pipelines.

## Neutral vs brand terminology

When brand context = `__all__`, analytics should use workspace-neutral labels; when a brand is selected, prefer `Brand.defaultBusinessMode` + brand glossary (future).

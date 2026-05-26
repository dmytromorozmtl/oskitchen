# Brand-scoped production

## Goals

- All-brands vs single-brand views on production boards.  
- Brand badges on tasks derived from related order/product brand.  
- Batch prep by brand for packing labels.

## Current state

- `KitchenTask` has no direct `brandId`; linkage is via `relatedOrder` / `relatedProduct`.  
- Brand detail tab links to `/dashboard/production` for operational access.

## Ghost kitchen pattern

Shared stations, color-coded / badge-coded tickets, optional brand priority weights stored later in `productionSettingsJson`.

## Next steps

- Resolve brand at query time via order → `brandId`.  
- Extend packing label templates with brand name + slug.

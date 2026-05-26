# Export center

## Routes

- **UI:** `/dashboard/import-export/export`
- **API:** `GET /api/export?type=<ExportType>`

## Supported types

See `lib/import-export/export-types.ts` (`ALL_EXPORT_TYPES`).

Legacy: `orders`, `customers`, `products`, `production`, `inventory`, `integrations_metadata`.

Extended: `menus`, `brands`, `locations`, `recipes`, `suppliers`, `purchase_orders`, `costing_snapshots`, `ingredient_demand`, `nutrition_labels`, `packing`, `reports`, `audit_logs` (superadmin only).

## Future: filters and jobs

- POST body or query for `filtersJson` (date range, brand, location, status, business mode).
- Optional JSON export; PDF only where report generators already exist.
- Async `ExportJob` with `QUEUED` / `RUNNING` for large extracts.

## Security

- Session required.
- `audit_logs` gated by `isSuperAdminEmail` in `app/api/export/route.ts`.

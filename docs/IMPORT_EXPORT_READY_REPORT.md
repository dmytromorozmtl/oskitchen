# Import / export — ready report

**Date:** 2026-05-07  
**Scope:** Data Operations Center (phase 1–4 + partial 5–9), Prisma job tracking, services, docs.

## What changed

- **`/dashboard/import-export`** layout with subnav and child routes: overview, import, export, templates, import/export history, validation errors, settings.
- **`/api/export`** delegates to `buildExportCsv` + `recordExportJob`; adds **packing**, **reports** placeholder, **audit_logs** (superadmin-only), keeps all legacy `type` values.
- **`/api/import-export/template`** serves documented CSV templates.
- **Ingredient CSV** preview: server action → `createIngredientCsvPreviewJob` → `ImportJob` + `ImportJobPreviewRow` only (no catalog writes).
- **KPI service** `loadDataOperationsOverview` for dashboard cards.
- **Client upload** component for ingredient preview with navigation to job detail.

## Exports supported

- Legacy: orders, customers, products (menu items), production, inventory (ingredients), integrations_metadata.  
- Extended: menus, brands, locations, recipes, suppliers, purchase_orders, costing_snapshots, ingredient_demand, nutrition_labels, packing, reports (placeholder CSV), audit_logs (superadmin).

## Imports supported

- **Preview pipeline:** ingredients.  
- **Planned:** customers, menu items, recipes, suppliers, orders, brands, locations, nutrition, product mapping, menu assignments (validators + executors to be added per type).

## Templates

- Eleven kinds via `template-definitions.ts` + download API; templates page in UI.

## Validation preview

- Row-level status, errors, normalized JSON, suggested action; job summary JSON.  
- Cross-job error list on validation-errors route.

## Duplicate handling

- Summaries in preview builder for ingredients; full duplicate/update modes documented in `DUPLICATE_UPDATE_STRATEGY.md` (executor pending).

## Rollback

- Schema + UI placeholder; execution documented in `IMPORT_ROLLBACK.md` (not production-executing yet).

## Security

- Session-gated APIs; tenant scoping on queries; formula injection mitigation on export; upload size/row caps; superadmin gate for audit export.

## Permissions

- Currently session + ownership; role matrix and workspace member rules to be extended per `UserRole` / workspace membership.

## Remaining limitations

- No UI column mapper for all types yet.  
- No confirmed import execution / transactions / rollback application.  
- Export filters (date, brand, location) not in API yet.  
- No async large-file worker.  
- `DataTemplate` DB records unused (static templates only).  

## Next recommendations

1. Implement **confirmed import** for ingredients with idempotent creates + `targetEntityId` backfill.  
2. Add **error CSV download** endpoint per job.  
3. Wire **AuditLog** on import confirm and rollback.  
4. **POST /api/export** with `filtersJson` + queued jobs for large tenants.  
5. Role-based **authorization matrix** aligned with kitchen roles (owner/manager/accountant/staff/viewer).

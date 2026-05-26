# Import / Export Audit Events

## Imports

- `IMPORT_COMMITTED` after successful `commitImportJob` with aggregate counts in metadata (no raw CSV content).

## Exports

- `AUDIT_EXPORT_GENERATED` after each CSV/JSON export from the Audit Center (includes `rowCount`, `format`).
- `AuditExport` table stores job metadata for compliance history.

## Reports

Report downloads from `/dashboard/analytics/reports` should call `auditLog` with `category: REPORTS` (follow-up task).

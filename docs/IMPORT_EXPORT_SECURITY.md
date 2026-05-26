# Import / export security

## Authentication

- `/api/export` and `/api/import-export/template` require a valid Supabase session (`createClient` server helper).
- No presigned public URLs carrying secrets.

## Authorization

- Queries scope by `userId` (and workspace rules for brands).
- `audit_logs` export: **`isSuperAdminEmail`** only (`lib/platform-owner.ts` — canonical platform root).

## CSV injection (exports)

- `sanitizeSpreadsheetScalar` prefixes dangerous leading characters (`=`, `+`, `-`, `@`) for string cells so Excel/Sheets do not treat them as formulas.

## Upload limits

- `MAX_IMPORT_BYTES`, `MAX_IMPORT_ROWS`, preview row cap — see `lib/import-export/limits.ts` and `/dashboard/import-export/settings`.

## Data minimization

- Preview stores normalized + raw JSON for review; avoid secrets and PII not required for validation.
- Integration export omits tokens (`integrations_metadata` is metadata only).

## Audit

- `ExportJob` rows record downloads.
- `ImportJob` rows record previews and (future) confirmed imports.

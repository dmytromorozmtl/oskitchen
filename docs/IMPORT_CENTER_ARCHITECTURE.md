# Import Center architecture

The Import Center is a safe data-import workflow built on top of the
existing Import / Export Center primitives. Two consumers exist:

- **`/dashboard/import-center`** — the dedicated Import Center
  workflow with KPIs, upload wizard, job detail, history, templates,
  error reports, and settings.
- **`/dashboard/import-export`** — the broader Data Operations Center
  (imports + exports + analytics). It continues to operate against
  the same Prisma models.

```
                ┌──────────────────────────────┐
                │   /dashboard/import-center   │
                └────────────┬─────────────────┘
                             │
            ┌────────────────┴──────────────────┐
            │  components/dashboard/import-     │
            │     center/{upload-form,          │
            │     kpi-grid, status-badge,       │
            │     job-actions}.tsx              │
            └────────────────┬──────────────────┘
                             │
                ┌────────────▼──────────────┐
                │   actions/import-center.ts │
                │ (Server Actions w/ Zod +   │
                │   permission checks)       │
                └────────────┬──────────────┘
                             │
        ┌────────────────────▼─────────────────────┐
        │ services/import-center/                  │
        │   import-center-service.ts               │
        │   (upload, commit, rollback, list, KPI)  │
        └────────────────────┬─────────────────────┘
                             │
        ┌────────────────────▼─────────────────────┐
        │ lib/import-center/                       │
        │   import-types.ts                        │
        │   import-status.ts                       │
        │   import-permissions.ts                  │
        │   import-templates.ts                    │
        │   csv-parser.ts          (re-export)     │
        │   column-mapping.ts                      │
        │   validators.ts                          │
        │   duplicate-detection.ts                 │
        │   import-preview.ts                      │
        │   import-commit.ts                       │
        │   import-rollback.ts                     │
        └────────────────────┬─────────────────────┘
                             │
              shares with    │
                             ▼
        ┌──────────────────────────────────────────┐
        │ lib/import-export/        (csv-parser,   │
        │   csv-format,                            │
        │   csv-validator,                         │
        │   import-preview,                        │
        │   limits)                                │
        └──────────────────────────────────────────┘
                             │
                             ▼
        ┌──────────────────────────────────────────┐
        │ Prisma (additive extensions)             │
        │ - ImportJob (extended)                   │
        │ - ImportJobPreviewRow (extended)         │
        │ - ImportRowError                         │
        │ - ImportRollback                         │
        │ - DataTemplate                           │
        └──────────────────────────────────────────┘
```

The lib layer is **pure** (no DB, no fetch). The service layer is the
**only** place that touches Prisma for Import Center reads and
writes. Server actions are **thin** — they validate input with Zod,
gate by permissions, and delegate to the service layer.

## Data flow

1. **Upload.** The user submits an `(type, mode, file)` form.
   `uploadImportCsvAction` reads the file, calls `uploadImportCsv`,
   which:
   - enforces `MAX_IMPORT_BYTES` / `MAX_IMPORT_ROWS`,
   - calls `parseCsv` (CSV parsing),
   - calls `suggestImportMapping` (or honours the override),
   - calls `loadExistingMatches` for the workspace to populate
     duplicate detection,
   - calls `buildImportPreview` (mapping → validation → dedupe →
     summary),
   - persists an `ImportJob` (status `VALIDATED` or `MAPPING`) and up
     to `MAX_PREVIEW_ROWS_PERSISTED` `ImportJobPreviewRow` rows.

2. **Preview & commit.** The job detail page (`/jobs/[jobId]`) reads
   `getImportJob` and renders per-row status, action, errors,
   warnings, and any duplicate match. Commit only fires when the
   user submits the confirm form with `confirm=true`. The service
   loops over eligible preview rows and writes to the appropriate
   live table.

3. **Rollback.** On a successful commit the service stores a
   `rollbackJson` plan with the ids of every record it created. The
   rollback action removes those records (skipping protected ones)
   and writes an `ImportRollback` audit row.

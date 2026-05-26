# Import Center — ready report

## What changed

The Import Center route (`/dashboard/import-center`) has been rebuilt
from a single-card upload form into a complete safe-import workflow:

- A new sub-navigation with Overview, Upload, History, Templates,
  Error reports, and Settings.
- Six KPI tiles (imports this month, pending validation, ready to
  commit, rows imported, rows with errors, rollback-eligible jobs).
- A redesigned upload form with import type + commit mode +
  file picker, in-page validation, and explicit “Upload &
  validate” copy (no silent commit).
- A new job detail page (`/dashboard/import-center/jobs/[jobId]`)
  with row-level status, action, errors, warnings, target entity
  hints, and per-job error-CSV download.
- A safe commit panel (`VALID` rows only by default; warnings
  require explicit opt-in) and a rollback panel with required
  reason.
- A rich templates page (`/dashboard/import-center/templates`) for
  every supported type.
- A new history table (`/dashboard/import-center/history`).
- A new error report page (`/dashboard/import-center/errors`).
- A settings page (`/dashboard/import-center/settings`) listing
  limits, security policy, and commit support per type.

On the data side, Prisma was extended additively:

- `ImportType` now includes `BRANDS`, `LOCATIONS`,
  `NUTRITION_ALLERGENS`, `PRODUCT_MAPPINGS`, `MENU_ASSIGNMENTS`,
  `PURCHASE_ITEMS`.
- New enum `ImportCommitMode`.
- `ImportJob` gained `rejectedRows`, `commitMode`, `previewJson`,
  `rollbackJson`, `validatedAt`, `committedAt`, `rolledBackAt`.
- `ImportJobPreviewRow` gained `duplicateOfId`.
- A composite `(user_id, status)` index on `ImportJob`.

A new module namespace under `lib/import-center/` owns the pure
helpers (types, status labels, permissions, templates, parser,
mapping, validators, duplicate detection, preview, commit + rollback
helpers). `services/import-center/import-center-service.ts` owns the
DB orchestration and `actions/import-center.ts` owns the server
actions (with Zod validation and permission gating).

## Supported import types

| Type                  | Preview | Commit |
|-----------------------|:-------:|:------:|
| PRODUCTS              |   ✅    |   ✅   |
| CUSTOMERS             |   ✅    |   ✅   |
| INGREDIENTS           |   ✅    |   ✅   |
| STAFF                 |   ✅    |   ✅   |
| ORDERS                |   ✅    |   —    |
| RECIPES               |   ✅    |   —    |
| SUPPLIERS             |   ✅    |   —    |
| BRANDS                |   ✅    |   —    |
| LOCATIONS             |   ✅    |   —    |
| NUTRITION_ALLERGENS   |   ✅    |   —    |
| PRODUCT_MAPPINGS      |   ✅    |   —    |
| MENU_ASSIGNMENTS      |   ✅    |   —    |
| PURCHASE_ITEMS        |   ✅    |   —    |

“Preview” means the type runs through validation + duplicate
detection and persists `ImportJobPreviewRow` rows. “Commit” means
the type also writes to a live table. Non-committable types finish at
preview and surface a clear banner explaining where to commit them
(brands → Brands module, etc.).

## Upload flow

1. User picks a type, commit mode, and CSV.
2. Action enforces `MAX_IMPORT_BYTES`, parses CSV, suggests column
   mapping, loads existing matches for dedupe.
3. `buildImportPreview` evaluates every row deterministically.
4. Service persists the `ImportJob` and up to 800 preview rows.
5. The user lands on the job detail page with full row-level KPIs
   and the commit / cancel panel.

## Column mapping

Auto-mapping uses the canonical field key + any declared aliases. A
helper records required columns that could not be mapped; jobs with
missing required columns sit in status `MAPPING` and cannot commit.

## Validation preview

Per-row decision tree combines validator output (errors / warnings)
with batch + workspace duplicate detection and the selected commit
mode to produce one of:

- status `VALID` / `WARNING` / `ERROR` / `DUPLICATE` / `SKIPPED`
- action `CREATE` / `UPDATE` / `SKIP` / `REJECT`

The preview summary (counts) is mirrored onto `ImportJob.previewJson`.

## Duplicate strategy

Type-specific dedupe keys (see `IMPORT_CENTER_DUPLICATE_STRATEGY.md`).
Commit modes:

- `CREATE_ONLY` — skip duplicates entirely.
- `UPDATE_EXISTING` — update only matched rows, never insert.
- `UPSERT` — create when no match, update when match.
- `SKIP_DUPLICATES` — same as `CREATE_ONLY` (alias semantics).

In-batch duplicates always skip after the first occurrence.

## Commit flow

- Only `VALIDATED` jobs can commit.
- Only `VALID` rows commit by default; warnings require explicit
  opt-in.
- Per-type writers handle customer / staff / ingredient / product
  upsert behaviour.
- Outcome (`created / updated / skipped / rejected / warnings /
  notes`) is recorded on `result_json`.

## Rollback

- Captured at commit time; created entities are listed in
  `rollback_json`.
- Rollback requires a reason and an explicit confirmation.
- Records protected by FK constraints from downstream activity are
  skipped and reported in `rollbackNotes`.
- Each rollback writes an `ImportRollback` audit row.

## Templates

System-defined templates live in
`lib/import-center/import-templates.ts`. Each template lists
required + optional columns, sample row, validation notes, and a
boolean `committable` flag. CSV downloads pass every cell through
`csvEscapeCell` to prevent formula injection.

## Implementation integration

Implementation Center’s migration tab already reads `ImportJob`
history. The new Import Center routes are linked from the
Implementation pages where appropriate. The “Import data” links on
the existing Implementation pages continue to work and now route
into the workflow center.

## Permissions / security

- All server actions require an authenticated session, a profile,
  and a capability check (`canUseImportCenter(scope, cap)`).
- Workspace scoping is enforced server-side on every query.
- `workspace.moroz@gmail.com` keeps the superadmin bypass.
- File uploads are in-memory only; the original CSV is not stored.
- Error CSV downloads are sanitised against formula injection.
- Hard caps: 8 MB / 10 000 rows / 800 persisted preview rows.

## Remaining limitations

- The legacy form action (`createImportJobFromCsvVoid`) still lives
  in `actions/implementation.ts`. It is no longer wired to the
  Import Center UI; the new pipeline is the only flow the user sees.
  We kept the legacy commit reachable via `/dashboard/products` and
  similar entry points to avoid breaking existing implementations.
- Commit support is implemented for four types
  (`PRODUCTS / CUSTOMERS / INGREDIENTS / STAFF`). The other nine
  types finish at preview and direct the user to the relevant module
  for commit — this is intentional to avoid silent partial commits.
- Mapping is read-only in the UI (auto-mapper). A manual mapping
  step can be added without changing the service contract.
- Rollback reverses creates but not updates. Snapshotting updates
  for full undo can be added when needed.

## Next recommendations

1. **Manual mapping step.** Add a wizard between “Uploaded” and
   “Validated” when required columns can’t be auto-mapped.
2. **Commit writers** for ORDERS, SUPPLIERS, BRANDS, LOCATIONS,
   NUTRITION_ALLERGENS, PRODUCT_MAPPINGS, MENU_ASSIGNMENTS,
   PURCHASE_ITEMS — staged behind the same preview pipeline.
3. **Update snapshots.** Capture pre-update values per row so the
   rollback plan can revert updates as well as deletes.
4. **Audit events.** Mirror commits + rollbacks into
   `KitchenAuditEvent` for compliance reporting.
5. **Background processing.** Move large CSVs (> 1 000 rows) to a
   queued job so the upload action returns instantly.

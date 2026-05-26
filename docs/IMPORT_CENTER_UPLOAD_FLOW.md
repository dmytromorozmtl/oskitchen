# Import Center upload flow

This document describes what happens between the moment a user picks a
CSV and the moment the validation preview is ready.

## Inputs

The upload form (`components/dashboard/import-center/upload-form.tsx`)
collects:

- `type` — `ImportType` (one of 13).
- `mode` — `ImportCommitMode` (`CREATE_ONLY`, `UPDATE_EXISTING`,
  `UPSERT`, `SKIP_DUPLICATES`).
- `file` — the CSV (`text/csv`, ≤ 8 MB, ≤ 10 000 rows).

## Server action

```ts
uploadImportCsvAction(formData)   // actions/import-center.ts
```

1. `requireSessionUser` + `requireUserProfile`.
2. `canUseImportCenter(scope, "import.upload")` permission check.
3. Zod validates `type` and `mode`.
4. `await file.text()` reads the CSV into memory.
5. Delegates to `uploadImportCsv` (service).
6. `revalidatePath("/dashboard/import-center")` + history.
7. `redirect("/dashboard/import-center/jobs/{id}")`.

## Service

```ts
uploadImportCsv({ userId, performedById, type, filename, csvText,
                  commitMode, mappingOverride? })
```

1. Buffer size check vs `MAX_IMPORT_BYTES`.
2. `parseCsv(csvText, MAX_IMPORT_ROWS)`.
3. `suggestImportMapping(type, headers)` (or use override).
4. `loadExistingMatches(userId, type)` populates the dedupe lookup
   from live workspace data (PRODUCTS / CUSTOMERS / INGREDIENTS /
   STAFF). Other types start with an empty lookup; in-batch dedupe
   still works.
5. `buildImportPreview({ type, headers, rows, mappingOverride,
   commitMode, existing })` returns `PreviewResult`:
   - `headers`, normalised rows, `validationStatus`, `action`,
     `errors`, `warnings`, `duplicateOfId`, `targetEntityId`.
   - `summary` (total / valid / warning / error / duplicate /
     skipped / create / update / reject counts).
   - `unresolvedRequiredColumns[]` — required canonical fields that
     could not be mapped.
6. Writes `ImportJob` (status `MAPPING` if required columns are
   unresolved, otherwise `VALIDATED`).
7. Writes up to `MAX_PREVIEW_ROWS_PERSISTED` (`800`)
   `ImportJobPreviewRow` rows. The remaining rows are discarded for
   storage but their counts are still in `previewJson`.

## Output

The action redirects to `/dashboard/import-center/jobs/{id}` where the
detail page renders:

- KPIs (valid / warnings / errors / duplicates,
  create / update / skip / reject).
- Commit panel if status is `VALIDATED` and the type is committable.
- Cancel panel if status is in `UPLOADED` / `MAPPING` / `VALIDATED`.
- Per-row preview table (first 500 rows) with status badges, action
  badges, error/warning lists, normalised JSON, and the target
  entity id if the row will update.
- Error-CSV download (preserves formula injection sanitisation).

## Safety contract

- File parsing is in memory only.
- No production rows are written during upload.
- Commit is a separate, explicit user action.

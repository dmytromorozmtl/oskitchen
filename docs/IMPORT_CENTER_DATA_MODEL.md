# Import Center data model

The Import Center reuses the Prisma models introduced by the Import /
Export Center and adds a small additive layer of fields needed for the
new workflow.

## Enums

### `ImportType`

```
PRODUCTS
CUSTOMERS
ORDERS
INGREDIENTS
RECIPES
STAFF
SUPPLIERS
BRANDS                  (added)
LOCATIONS               (added)
NUTRITION_ALLERGENS     (added)
PRODUCT_MAPPINGS        (added)
MENU_ASSIGNMENTS        (added)
PURCHASE_ITEMS          (added)
```

### `ImportStatus`

```
UPLOADED       -- raw file received, awaiting validation
MAPPING        -- required columns missing; awaiting user mapping
VALIDATED      -- validation passed, preview ready for commit review
IMPORTED       -- commit succeeded
FAILED         -- commit hit an unrecoverable error
CANCELLED      -- user cancelled before commit
```

### `ImportCommitMode` (added)

```
CREATE_ONLY        -- only insert new rows; skip duplicates
UPDATE_EXISTING    -- only update existing rows; never insert
UPSERT             -- create new, update existing
SKIP_DUPLICATES    -- create new, skip rows that match existing records
```

### `ImportPreviewRowStatus`, `ImportPreviewRowAction`,
### `ImportRollbackRecordStatus`

Unchanged from the Import / Export Center.

## Tables

### `import_jobs`

```
id                uuid   primary key
user_id           uuid   workspace owner (FK → user_profiles.id)
type              ImportType
filename          varchar(512)
status            ImportStatus default UPLOADED
total_rows        int    default 0
valid_rows        int    default 0
warning_rows      int    default 0
error_rows        int    default 0
duplicate_rows    int    default 0
skipped_rows      int    default 0
updated_rows      int    default 0
created_rows      int    default 0
rejected_rows     int    default 0    (added)
commit_mode       ImportCommitMode    (added)
file_size         int    default 0
mapping_json      jsonb
settings_json     jsonb
preview_json      jsonb               (added)
result_json       jsonb
rollback_json     jsonb               (added)
error_message     text
created_by_id     uuid   FK → user_profiles.id (set null)
created_at        timestamp default now
validated_at      timestamp           (added)
committed_at      timestamp           (added)
rolled_back_at    timestamp           (added)
completed_at      timestamp

indexes:
  (user_id, created_at)
  (type)
  (status)
  (user_id, status)                   (added)
```

### `import_job_preview_rows`

```
id                  uuid   primary key
import_job_id       uuid   FK → import_jobs.id (cascade)
row_number          int
raw_json            jsonb
normalized_json     jsonb
validation_status   ImportPreviewRowStatus default ERROR
errors_json         jsonb
warnings_json       jsonb
action              ImportPreviewRowAction default REJECT
target_entity_id    uuid                       (existing record being updated)
duplicate_of_id     uuid                       (added — in-batch dup pointer)
imported_at         timestamp                  (set on commit)
created_at          timestamp default now

indexes:
  (import_job_id)
  (import_job_id, validation_status)
```

### `import_row_errors`

Legacy error rows produced by the older form-based import path. The
new Import Center stores errors on each preview row (`errors_json`)
and only writes to this table from the legacy `actions/implementation`
path.

### `import_rollbacks`

```
id                    uuid primary key
import_job_id         uuid FK → import_jobs.id (cascade)
performed_by_id       uuid FK → user_profiles.id (set null)
reason                text
records_rolled_back   int default 0
status                ImportRollbackRecordStatus default PENDING
created_at            timestamp default now
```

### `data_templates`

Reused for shared template metadata (download CSV, version,
optional/required columns). The Import Center currently reads its
template definitions from `lib/import-center/import-templates.ts`
which is the authoritative source.

## Field-level invariants

- `import_jobs.status` is the source of truth for commit eligibility.
  Only `VALIDATED` jobs may be committed.
- `import_jobs.rollback_json` is set if and only if commit created
  rows that can be safely undone.
- `import_jobs.committed_at` is set when commit completes.
- `import_jobs.rolled_back_at` is set when rollback completes.
- `import_jobs.preview_json` mirrors the in-memory `PreviewSummary`
  for the row stats shown on the detail page.
- `import_job_preview_rows.target_entity_id` is set when the row will
  update an existing record (UPDATE / UPSERT mode).

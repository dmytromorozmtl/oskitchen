# Import Center commit flow

Commit transforms a `VALIDATED` import job's preview rows into live
OS Kitchen records. The transformation is type-specific and never
silent.

## Pre-conditions

The commit server action fails closed if any of the following are
false:

- The user has the `import.commit` capability.
- The job exists for this user (workspace scoping).
- The job's status is `VALIDATED`.
- The job's type is in `COMMITTABLE_TYPES` (currently
  `PRODUCTS / CUSTOMERS / INGREDIENTS / STAFF`).
- The form includes `confirm=true`.

The action also accepts an optional `includeWarnings=on` flag. When
unset, only `VALID` rows are committed.

## Eligible row filter

```ts
const eligibleStatuses = includeWarnings ? [VALID, WARNING] : [VALID];
const eligibleActions  = [CREATE, UPDATE];
eligible = previewRows.filter(r =>
    eligibleStatuses.includes(r.validationStatus)
    && eligibleActions.includes(r.action));
```

Rows with status `ERROR`, `DUPLICATE`, or `SKIPPED` are never
committed. Rows with action `SKIP` or `REJECT` are never committed.

## Per-type writers

### CUSTOMERS
- Loads the existing customer by `userId_email` unique key.
- `CREATE` if none, `UPDATE` if action is `UPDATE`, else `SKIP`.
- New rows store `source = "IMPORT"`.

### STAFF
- Looks up existing staff by `email` when available.
- `CREATE` new or `UPDATE` existing per row action.

### INGREDIENTS
- `UPDATE` when `row.targetEntityId` is set (mapped during preview).
- `CREATE` otherwise.

### PRODUCTS
- Resolves the active or catalog-only menu via
  `ensureCatalogMenu(userId)`.
- `CREATE` new product + `ProductionTask` shell.
- `UPDATE` existing product when `row.targetEntityId` is set.

### Preview-only types

Returns `commitNotSupportedReason(type)` and never writes. The
service signals this explicitly to the action layer so the UI can
show a “Preview-only import type” banner without the commit button.

## Outcome record

```ts
type CommitOutcome = {
  created:  number;
  updated:  number;
  skipped:  number;
  rejected: number;
  warnings: number;
  notes:    string[];
};
```

Persisted on `import_jobs.result_json`. The Import Center detail page
reads it to show what actually happened versus the preview prediction.

## Failure handling

If any per-row write throws:

- The exception message is recorded on `import_jobs.error_message`.
- The job status moves to `FAILED`.
- The partial `rollback_json` is still written so the user can undo
  the rows that were already inserted.

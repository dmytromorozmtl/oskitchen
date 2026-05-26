# Import Center QA checklist

A condensed acceptance suite for manual + automated regression.

## Upload

- [ ] Upload form lists 13 import types.
- [ ] Type selector pre-fills `PRODUCTS` if `?type=` query is missing.
- [ ] Commit mode selector lists `CREATE_ONLY`, `UPDATE_EXISTING`,
      `UPSERT`, `SKIP_DUPLICATES`.
- [ ] Uploading a missing file shows a “please select a CSV” error.
- [ ] Uploading a file > 8 MB is rejected with a clear error.
- [ ] Uploading a CSV with no header row is rejected.
- [ ] Uploading > 10 000 rows truncates to 10 000 with no crash.
- [ ] Upload always creates an `ImportJob` and redirects to the job
      detail page.

## Templates

- [ ] `/dashboard/import-center/templates` lists every import type.
- [ ] Each template card shows required + optional columns, a sample
      row, and validation notes.
- [ ] Each template download returns a CSV with the canonical
      header row and one example row.

## Validation preview

- [ ] Required columns missing → status `MAPPING_REQUIRED` (status
      badge “Mapping required”). Commit button is hidden.
- [ ] Required columns present, valid rows → status `VALIDATED`.
- [ ] PRODUCTS: missing `title` → row marked `ERROR`/`REJECT`.
- [ ] CUSTOMERS: invalid email → row marked `ERROR`/`REJECT`.
- [ ] INGREDIENTS: duplicate `(name, unit)` in the same file →
      second occurrence `DUPLICATE`/`SKIP`.
- [ ] NUTRITION_ALLERGENS: unrecognised allergen → row marked
      `WARNING`.
- [ ] Mode `UPDATE_EXISTING` with no match → row marked
      `SKIPPED`/`SKIP`.
- [ ] Mode `UPSERT` with existing match → row marked
      `VALID`/`UPDATE`.
- [ ] Mode `CREATE_ONLY` with existing match → row marked
      `DUPLICATE`/`SKIP`.

## Commit

- [ ] Commit button is hidden until status is `VALIDATED` and at
      least one row is `VALID`.
- [ ] Commit panel toggles `Also commit warning rows` only when
      warnings exist.
- [ ] Commit fails closed without `confirm=true`.
- [ ] Preview-only types show a banner and no commit button.
- [ ] Commit success updates job status to `IMPORTED` and shows
      `committedAt`.
- [ ] Commit failure marks job status `FAILED` and persists any
      rollback plan that was collected.

## Rollback

- [ ] Rollback panel only appears when status is `IMPORTED` and the
      rollback plan is available.
- [ ] Rollback form requires a non-empty reason.
- [ ] Rollback updates `rolled_back_at` and records an
      `ImportRollback` row.
- [ ] Rollback deletes only the recorded created entities; updates
      are not reversed.
- [ ] FK-protected entities are skipped and reported in
      `rollbackNotes`.

## History

- [ ] `/dashboard/import-center/history` lists up to 100 jobs.
- [ ] Each row links to the job detail page.
- [ ] Rollback status is shown for rolled-back jobs.

## Error reports

- [ ] `/dashboard/import-center/errors` lists per-row errors across
      jobs.
- [ ] “Download error CSV” returns a CSV with row number, error
      codes, messages, warnings, and raw row JSON.
- [ ] Every cell in the error CSV is escaped against formula
      injection (`=`, `+`, `-`, `@`, tab leading characters).

## Permissions

- [ ] Logged-out user lands on `/login` for any Import Center route.
- [ ] `workspace.moroz@gmail.com` retains full access via the
      superadmin bypass.
- [ ] A user without `import.commit` cannot fire commit (the action
      throws).
- [ ] A user without `import.upload` cannot upload (the action
      throws).

## Builds

- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.

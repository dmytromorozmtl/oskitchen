# Import Center validation preview

The preview is the deterministic decision tree that turns a parsed
CSV into per-row commit guidance.

## Inputs

- `type` (`ImportType`)
- `headers[]` (CSV column names as parsed)
- `rows[]` (`Record<string,string>[]` after CSV parse)
- `mapping` (`{ canonicalKey: csvHeader }`)
- `commitMode` (`ImportCommitMode`)
- `existing` (`ExistingMatchLookup` populated from the workspace)

## Per-row pipeline

For each row:

1. **Map.** `applyMapping(rawRow, mapping)` produces a
   `{ canonicalKey: value }` object.
2. **Validate.** `validateRow(type, mapped)` returns
   `{ normalized, errors[], warnings[] }` (see
   `IMPORT_CENTER_VALIDATORS.md`).
3. **Decide status & action.**

```
if errors.length > 0:
    status  = ERROR
    action  = REJECT
else:
    key = dedupeKey(type, normalized)
    matchedExistingId = existing.matches.get(key)
    matchedInBatch = seenInBatch.has(key)
    if matchedExistingId:
        switch commitMode:
            CREATE_ONLY     → status DUPLICATE, action SKIP
            UPDATE_EXISTING → status VALID/WARNING, action UPDATE
            UPSERT          → status VALID/WARNING, action UPDATE
            SKIP_DUPLICATES → status DUPLICATE,  action SKIP
        targetEntityId = matchedExistingId
    elif matchedInBatch:
        status = DUPLICATE
        action = SKIP
    else:
        if commitMode == UPDATE_EXISTING:
            status = SKIPPED
            action = SKIP
        else:
            status = warnings.length ? WARNING : VALID
            action = CREATE
```

4. **Accumulate** counts onto the running `PreviewSummary`.

## Preview summary

```ts
type PreviewSummary = {
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  duplicateRows: number;
  skippedRows: number;
  createCount: number;
  updateCount: number;
  rejectCount: number;
}
```

The summary is persisted on the `ImportJob.previewJson` field and is
the source of truth for the job-detail KPI tiles.

## Persistence cap

Up to `MAX_PREVIEW_ROWS_PERSISTED` (currently `800`) `ImportRow`
records are written. The remaining rows are aggregated into the
`PreviewSummary` so counts remain correct even when individual rows
are not stored. This protects the database from runaway CSVs.

## What the UI does with the preview

- Stat blocks summarise every count.
- A table shows the first 500 rows with status, action, errors,
  warnings, normalised JSON, and a duplicate / target-entity id.
- The commit panel hides until status is `VALIDATED` and at least
  one row is `VALID`. Warning rows can only be committed when the
  user explicitly opts in via the “Also commit warning rows” box.

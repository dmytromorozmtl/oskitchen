# Import failure runbook

## Symptoms
- `ImportJob` stuck FAILED or validation errors spike
- Operators report timeouts on large CSV

## First checks
1. File size vs `lib/imports/import-limits.ts` soft warnings.
2. Row-level errors in Import center.
3. DB connectivity / pool saturation.

## Safe actions
- Split file, fix encoding, re-upload.
- Do not delete production orders without audited workflow.

## Escalation
- For recurring timeouts, track `docs/BACKGROUND_IMPORT_EXPORT_JOBS.md` — object storage + worker required.

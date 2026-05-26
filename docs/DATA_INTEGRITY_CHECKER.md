# Data integrity checker

## Implementation pointer

- `services/integrity/integrity-service.ts` (+ UI under `/dashboard/system-health/data-integrity`).

## Example rules

Orders without items, delivery without address, orphaned packing/production rows, stuck imports/jobs, inconsistent billing flags.

## Each issue should expose

Severity, entity id, human explanation, fix route, optional safe auto-fix (idempotent, narrowly scoped).

## Priority

**P1** — prevents silent ops debt.

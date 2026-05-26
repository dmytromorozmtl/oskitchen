# Import rollback

## Model

`ImportRollback` links to `ImportJob` with `reason`, `recordsRolledBack`, `status` (`ImportRollbackRecordStatus`).

## Rules (target)

- Roll back rows **created** by the import job (store `targetEntityId` on preview / result rows).
- Updates: only if previous values were snapshotted before write.
- Block or warn if downstream modules mutated entities (production, fulfillment).
- Destructive rollback requires explicit confirmation + audit event.
- Orders already in production: warn hard.

## Current state

- Schema and UI copy present; transactional import + rollback executor not yet wired.

## Audit

Each rollback should emit `AuditLog` entries referencing the import job id.

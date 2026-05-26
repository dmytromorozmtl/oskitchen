# Audit Retention Policy

## Model

`AuditRetentionPolicy` — per workspace (`workspaceId` unique): `retentionDays`, `exportBeforeDelete`, `archiveBeforeDelete`, `legalHoldNote`, `active`.

## UI

`/dashboard/audit-logs/retention` — owner/admin/platform superadmin can upsert policy.

## Enforcement

Automated purge/archive jobs are **not** scheduled in this changeset; clamping helpers live in `lib/audit/audit-retention.ts` (`clampRetentionDays`). Wire a cron/worker to respect policy + legal hold before deletion.

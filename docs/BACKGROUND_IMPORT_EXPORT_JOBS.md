# Background import / export jobs

## Current
- `ImportJob`, `ExportJob`, `ChannelSyncJob` persist lifecycle in Postgres.
- Soft limits: `lib/imports/import-limits.ts`, `lib/exports/export-limits.ts`.

## Gap
- Very large files still risk serverless timeouts without object storage + worker fleet.

## Services
- `services/jobs/background-job-service.ts` — lightweight counters (extend for orchestration).
- `services/storage/object-storage-service.ts` — `OBJECT_STORAGE_BUCKET` reserved flag.

## UX
- Surfaces: import center, import-export, platform tools — keep explicit “large file” messaging until worker lands.

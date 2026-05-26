# Channel import staging

## Purpose
`ChannelImportBatch` + `ChannelImportRecord` model the pipeline **after** normalization and **before** risky promotion. Webhooks use `source_dedupe_key = webhook_event:{id}`; sync jobs use `sync_job:{channelSyncJobId}`.

## Statuses
Batch: `DRAFT` → `VALIDATING` → `NEEDS_REVIEW` | `READY_TO_IMPORT` → `IMPORTED` | `PARTIAL` | `FAILED` | `CANCELLED`.  
Record validation: `VALID`, `WARNING`, `ERROR`, `DUPLICATE`, `NEEDS_MAPPING`.

## Operator flows
- **Review** `/dashboard/sales-channels/imports/{batchId}` — approve valid rows, retry validation, export error CSV, rollback safe approvals.
- **Filters** `/dashboard/sales-channels/staging?status=NEEDS_REVIEW`.

## Links
`ExternalOrder.channelImportBatchId` connects Hub rows back to batches for traceability.

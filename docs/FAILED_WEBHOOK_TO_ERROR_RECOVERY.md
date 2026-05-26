# FAILED webhook jobs → error recovery

## Behavior

When a `WebhookProcessingJob` reaches a **terminal failed** state (and similar missing-connection terminal path), `upsertWebhookJobFailureRecoveryItem` writes/updates `error_recovery_items` with:

- `source = WEBHOOK_JOB`
- `sourceId = webhook_job:<jobId>` (stable unique)
- Provider, event type, webhook event id, attempts/max, last error (redacted at higher layers when displayed)
- `safeRetryHref` → `/dashboard/sales-channels/webhooks`

On successful processing, `resolveWebhookJobRecoveryItemIfExists` marks the row **RESOLVED**.

## Deduplication

Prisma `@@unique([source, sourceId])` ensures one open row per job id; upsert updates metadata on repeated failures.

## Surfacing

- `listWorkspaceErrorEvents` / `listPlatformErrorEvents` inject synthetic `WEBHOOKS` events with id `errorRecovery:<uuid>`.
- Rollup counts include `openWebhookJobRecoveries`.
- Platform + workspace health pages show the open recovery count.

## Service entrypoint

- `services/recovery/error-recovery-service.ts` re-exports webhook recovery helpers for a stable module path.

## Tests

- Covered indirectly via unit tests on audit + rate limit; add dedicated Prisma integration test when CI DB fixture exists.

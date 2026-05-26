# Async webhook job processor

## Architecture

1. HTTP handler verifies signature, persists `WebhookEvent`, optionally enqueues `WebhookProcessingJob`.
2. Cron `GET|POST /api/cron/webhook-jobs` drains jobs with `runWebhookJobBatch`.
3. Worker locks row (`PROCESSING` + `lockedAt`), executes `executeInboundWebhookByProvider`, marks `PROCESSED` or schedules `RETRYING` / `FAILED`.

## Code map

| File | Role |
|------|------|
| `services/webhooks/webhook-job-runner.ts` | Lock, dispatch, retry |
| `services/webhooks/webhook-provider-router.ts` | Provider switch |
| `lib/webhooks/woocommerce-webhook-processor.ts` | Woo business logic |
| `lib/webhooks/shopify-webhook-processor.ts` | Shopify business logic |
| `services/webhooks/webhook-job-service.ts` | `drainWebhookJobs` wrapper |
| `lib/webhooks/webhook-job-config.ts` | `WEBHOOK_JOB_BATCH_SIZE`, `WEBHOOK_JOB_MAX_ATTEMPTS` |

## Status model

Prisma enum `WebhookProcessingJobStatus` is canonical. `lib/webhooks/webhook-job-status.ts` maps to human labels (e.g. `QUEUED` → `PENDING`).

## Retry policy

`services/webhooks/webhook-retry-service.ts` — capped exponential backoff; attempts compared to `maxAttempts` **after** increment while locking.

## Redaction

Payloads are stored on `WebhookEvent.payload_json` — never log raw signing headers. Use `redactWebhookJsonForLog` for diagnostics.

# Webhook queue, retry, replay

## Modes
1. **INLINE_LOW_VOLUME (default)** — `WEBHOOK_ASYNC_QUEUE` unset/false: handlers process in-request (existing behavior for Shopify, Stripe, etc.).
2. **DATABASE_WEBHOOK_JOBS** — `WEBHOOK_ASYNC_QUEUE=true`: WooCommerce creates `webhook_processing_jobs` after signed `webhook_events` row; HTTP returns `{ ok:true, queued:true }`; cron `/api/cron/webhook-jobs` drains batch via `runWebhookJobBatch`.

## Retry
- Exponential backoff with jitter (`webhook-retry-service.ts`), capped attempts on job row.

## Replay
- Documented in `services/webhooks/webhook-replay-service.ts` — **not** wired to privileged server action yet; requires audit events.

## Redaction
- `lib/webhooks/webhook-redaction.ts` for log-safe JSON.

## Migration
- `prisma/migrations/20260615180000_webhook_processing_jobs`

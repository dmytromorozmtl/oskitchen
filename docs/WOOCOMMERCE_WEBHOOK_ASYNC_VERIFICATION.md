# WooCommerce webhook async verification

## Goal

Prove `WEBHOOK_ASYNC_QUEUE=true` path: event → job → cron → `PROCESSED` / `FAILED` with retries.

## Steps

1. Configure WooCommerce webhook URL with valid `?cid=` connection id.
2. POST a signed test `order.*` payload (or use Woo “Send test delivery”).
3. Confirm `webhook_events` row: `signature_valid=true`, `processed=false` briefly.
4. Confirm `webhook_processing_jobs` row exists with `QUEUED`.
5. Invoke cron with bearer secret (or wait for Vercel cron).
6. Expect `processed=true` on event and `PROCESSED` on job for happy path.

## Failure drill

- Temporarily break downstream (e.g. invalid DB constraint in staging) → job should move `RETRYING` with `next_attempt_at`, then `FAILED` after `maxAttempts`.

## Automated tests

- Vitest: retry delay helper (`tests/unit/webhook-retry-service.test.ts`).
- Add fixture-based integration tests when a disposable Postgres URL is available in CI.

## Duplicate delivery

- Same `X-WC-Webhook-Delivery-Id` → `duplicate: true` response; no second job.

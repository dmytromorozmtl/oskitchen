# Notification log + retry queue

## Log structure

Every send / skip / failure writes one row to `notification_logs`:

- `status` ∈ {DRAFT, QUEUED, SENT, DELIVERED, OPENED, CLICKED, SKIPPED, FAILED, RETRYING, CANCELLED}.
- `category`, `channel`, `provider`, `templateKey`, `ruleId`,
  `triggerType`, `sourceType`, `sourceId`.
- `providerMessageId` — matches Resend's `email_id` for webhook reconciliation.
- `subject` — rendered subject for operator review.
- `errorMessage` — capped at 1000 chars.
- `retryCount` — int, capped at 5.
- `recipient` — the actual address (the only PII the log stores).
- Body text / HTML is *not* persisted in the log.

## Status transitions

- `sendNotification` writes `SENT` on success, `FAILED` on provider
  error, `SKIPPED` for opt-outs / log-only / dedupe collisions.
- `retryNotification` writes `RETRYING` then a fresh `SENT` / `FAILED`
  via a salted dedupe key.
- The Resend webhook can flip a `SENT` row to `DELIVERED`, `OPENED`,
  `CLICKED`, or `FAILED` once an event arrives.

## Retry queue rules

- Max 5 attempts.
- Refuses to retry if the row is missing template / recipient /
  category / channel.
- Refuses to retry if the provider is not configured (`canSendEmails()`
  returns false).
- Retries use a salted dedupe key so dedupe protection does not block
  legitimate operator-initiated retries.
- `cancelQueuedNotification` flips `QUEUED` / `RETRYING` rows to
  `CANCELLED`.

## UI

- **Log** tab — 200 most recent rows, no filters yet (followup).
- **Retry** tab — failed/retrying rows with one-click retry + queued
  rows with cancel.

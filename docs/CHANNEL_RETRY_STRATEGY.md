# Channel retry strategy

## Webhooks
Persist event → process once → `markWebhookProcessed`. On failure, error string stored; retries should be **partner-driven** replays with new ids. `ChannelRetryAttempt` model reserved for future worker.

## API sync
`ChannelSyncJob` captures coarse outcomes. Next: per-page backoff on 429/5xx, partial completion with resumable cursors.

## Model
`ChannelRetryAttempt` links optional `webhookEventId`, `syncJobId`, `recordId` with `attemptNumber`, `status`, `errorCode`.

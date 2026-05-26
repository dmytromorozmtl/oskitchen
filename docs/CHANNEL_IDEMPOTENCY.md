# Channel idempotency

## Rules implemented
1. **Webhooks** — duplicate `external_event_id` per user+provider rejected in app + optional DB unique index (`webhook_events_user_provider_external_event_uidx`).
2. **External orders** — `@@unique([connectionId, externalOrderId])` upsert path.
3. **Import batches** — `source_dedupe_key` unique (webhook event id, sync job id, simulation UUID).
4. **Import records** — `@@unique([batchId, provider, externalId])`.

## Code
See `lib/channels/idempotency.ts` for key builders shared across services.

## Replay
Replaying the same webhook id returns `{ duplicate: true }` at the route; safe for partners.

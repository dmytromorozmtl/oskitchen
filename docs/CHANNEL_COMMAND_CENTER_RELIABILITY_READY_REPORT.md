# Channel Command Center — reliability readiness report (May 2026)

## Shipped in this pass
- **Staging** — models, webhook + sync wiring, UI (`/staging`, `/imports/[batchId]`), CSV export hook, rollback guardrails.
- **Conflicts** — model + list UI + resolve/ignore.
- **Idempotency** — keys module, webhook partial unique index, batch/record uniques, duplicate-safe webhook store.
- **Rules** — model + create/toggle UI (execution deferred, honest in docs).
- **Production handoff** — persisted JSON + owner/super-admin form.
- **Simulation** — safe MANUAL batches + scenarios.
- **Webhook lab** — processed fixture storage (no route changes to `/api/webhooks/*`).
- **Rollback** — metadata reset + audit row + production safety check stub.
- **Reliability dashboard** — 7-day operational counts.
- **Permissions** — centralized helpers + server action enforcement.
- **Error taxonomy** — `lib/channels/channel-errors.ts`.
- **Order Hub** — batch links + test badge support.
- **Provider pages** — Woo + Shopify “what works / limitations” cards.

## Migrations required
Apply:
- `20260507194500_channel_import_pipeline_reliability`
- `20260507194600_external_order_channel_batch_link`

## Honest limitations
- Rule **actions** not executed automatically.
- Average webhook latency + partner downtime charts not yet implemented.
- CSV channel import does not yet create `ChannelImportBatch` rows (still Import Center).
- Redacted raw payload viewer pending.

## Next live integration work
1. Harden Shopify/Woo pagination + 429 backoff.
2. Promote approved external rows → internal `Order` + `OrderItem` with SKU resolution service (behind feature flag).
3. Wire `ChannelRetryAttempt` to a background worker.

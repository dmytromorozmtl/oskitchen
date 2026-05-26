# Webhook replay with audit

## Rules

- **Platform:** requires `platform:integrations:repair`; writes `PLATFORM_WEBHOOK_REPLAY_REQUESTED`.
- **Workspace:** integration owner or workspace `OWNER`/`ADMIN` for the owner’s workspace; writes `WEBHOOK_REPLAY_REQUESTED`.
- **Reason:** 8–2000 chars; audit stores a short `reasonPreview` (80 chars) plus length — not the full text by default (reduce PII surface).
- **Signature invalid:** workspace replay blocked; platform may check explicit attestation checkbox (still audited).

## Implementation

- `services/webhooks/webhook-replay-service.ts` — `requestWebhookReplay`.
- `actions/webhook-replay.ts` — `replayWebhookEventAction` (useFormState from UI).
- `components/integrations/webhook-replay-row.tsx` — per-event form.

## Async vs inline

- Async on: resets `WebhookEvent.processed` and (re)queues `WebhookProcessingJob` in `QUEUED`.
- Async off: runs `executeInboundWebhookByProvider` immediately after audit.

## Safety

- Replay may duplicate orders/products if provider idempotency is weak — **break-glass** only.

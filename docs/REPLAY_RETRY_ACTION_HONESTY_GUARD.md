# Replay / retry action honesty guard

## Helper

`lib/integrations/integration-action-availability.ts` — `getIntegrationActionAvailability(provider, action, context)`.

- `webhook_replay` and `integration_retry` return `available: false` unless caller passes `hasReplayServerAction` / `hasRetryServerAction: true` (future wiring).

## UI rules

- No replay/retry **buttons** on platform read-only integration health.
- Platform webhooks page already states replay disabled until audited server actions exist.
- Dashboard integration health failed-webhook card references error recovery when actions exist — unchanged.

## Audit

- Reserved strings in `lib/audit/platform-integration-audit-actions.ts` must only be emitted alongside real mutations.

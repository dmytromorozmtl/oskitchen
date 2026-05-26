# Replay / retry availability UI pass

## Library

`lib/integrations/integration-action-availability.ts` — `getIntegrationActionAvailability(provider, action, context)`.

- `hasReplayServerAction` / `hasRetryServerAction` must be **true** for “available” (not implemented in this pass).
- Platform repair permission is documented for when mutations ship.

## Shared UI

`components/integrations/integration-action-button.tsx`

- **Button** variant: disabled + tooltip when unavailable.
- **Inline** variant: compact “not available yet” + help tooltip (no audit side effects).

## Wired surfaces

- Platform: `/platform/webhooks`, `/platform/integrations`, `/platform/error-recovery`, read-only workspace integration health cards.
- Dashboard: `/dashboard/integration-health`, `/dashboard/error-recovery`, webhook logs, channel cards (webhook section).

## Non-goals (this pass)

- No fake server actions.
- No audit log entries from disabled buttons.
- No optimistic “Replay sent” toasts.

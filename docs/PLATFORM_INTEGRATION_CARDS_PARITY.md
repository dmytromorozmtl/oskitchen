# Platform integration cards parity

## Scope

Align `/platform/integrations`, `/platform/webhooks`, and workspace owner snapshots with the honest maturity model used in `/dashboard/integration-health`.

## Rules

- No credentials, tokens, or raw webhook payloads.
- Tiers: LIVE, BETA, SETUP_READY, PARTNER_ACCESS_REQUIRED, PARTIAL, ROADMAP, etc. — never auto-upgraded without E2E proof.
- Retry/replay buttons **omitted** until audited server actions exist.
- Audit: `PLATFORM_INTEGRATION_DIAGNOSTICS_VIEWED` on integrations + webhooks list views. Canonical strings live in `lib/audit/platform-integration-audit-actions.ts` (includes reserved `PLATFORM_WEBHOOK_REPLAY_REQUESTED` and `PLATFORM_INTEGRATION_RETRY_REQUESTED` for future real mutations only).

## Components

- `components/integrations/integration-maturity-table.tsx`
- `components/integrations/integration-maturity-card.tsx`
- `components/integrations/webhook-health-summary.tsx`
- `services/platform/platform-integrations-service.ts`

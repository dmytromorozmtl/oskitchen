# Support SLA workflow

## Existing implementation
- DB models: `SupportTicket`, `SupportSlaPolicy`, SLA fields on tickets.
- Services: `services/support/sla-service.ts`, `escalation-service.ts`, `ticket-service.ts`.
- Defaults in `lib/support/support-sla.ts` (critical ≈ 1h first response / 24h resolution narrative — tune per commercial policy).

## Gaps
- SLA badges in inbox UI and automated escalation jobs should be verified per deployment.
- Document customer-visible SLA only after legal/commercial approval.

## Recommendation for pilot
- Publish internal SLA table to CS team; keep marketing generic until measured.

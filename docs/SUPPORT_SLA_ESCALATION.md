# Support SLA & escalation

## SLA

- Policies in `support_sla_policies` (seeded globally per priority).  
- `sla-service` picks best match (workspace-specific beats global; priority/category increase score).  
- Fallback: `lib/support/support-sla.ts` default minute maps.  
- `slaDueAt` stored on ticket at creation.

## Escalation

- `evaluateEscalationSignals` — SLA overdue, critical priority, security category, already escalated.  
- `escalateSupportTicketAction` sets status `ESCALATED`, stamps `escalatedAt`, logs event, pings optional founder email via `notifyGrowthInbound` (same rules as growth: no fake send).

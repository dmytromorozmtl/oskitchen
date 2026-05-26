# Support escalation runbook

## Symptoms
- SLA overdue (`slaDueAt`), critical priority, security-tagged tickets

## First checks
1. `SupportTicket` status and `evaluateEscalationSignals` reasons.
2. Link to related order / webhook / import job IDs in ticket metadata.

## Safe actions
- Assign owner, post internal note, notify growth inbound for critical/security (`escalateSupportTicketNotify`).

## Customer template
> We’ve escalated your ticket to our on-call team and will update you within [window].

# Alert System (unification plan)

## Sources (existing)

- Today blockers + KPIs
- Notifications center + rules
- Executive / Copilot deterministic insights
- Platform support SLA views

## Target model

- **Alert record** (future): `{ id, severity, source, ownerUserId?, workspaceId?, route, dedupeKey }`
- **Delivery**: toast (client) + in-app inbox + optional email/push via Resend/webhooks
- **Lifecycle**: OPEN → ACK → RESOLVED (audit each transition)

## Current bridge

Today surfaces **operational blockers** derived from operational tables (integrations, webhooks, mapping backlog) without inventing synthetic alert rows.

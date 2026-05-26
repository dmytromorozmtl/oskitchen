# Partner analytics

## Current

Partner command center exposes:

- Portfolio KPIs (clients, onboarding, go-live week, risk, MRR, support load, expansion, churn proxy, revenue, health, training proxy).  
- Implementation stage distribution (bar chart + read-only Kanban columns).  
- Revenue mix by `PartnerRevenueType`.

## Planned

- Client growth time series (week/month).  
- Implementation cycle time (stage entered → exited).  
- Support analytics (median time open, backlog by tier).  
- Expansion funnel (health + expansion score thresholds).  
- Cohort charts for franchise / regional groupings once hierarchy exists.

## Data hygiene

All charts must call services that internally enforce `getAccessiblePartnerAccountIds` — never pass raw workspace ids from the browser into unscoped Prisma queries.

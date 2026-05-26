# Advanced analytics engine

## Current

- Executive / analytics routes under `/dashboard/analytics/*`, `/dashboard/executive/*`, reports, saved reports.
- Deterministic insights reuse executive KPIs for consistency.

## Target

- Persona dashboards (operations, finance, support) with **shared filter model** (`lib/analytics/filters.ts`).
- CSV export on heavy tables (respect RBAC — no hidden PII for restricted roles).

## Priority

**P2** product polish; **P1** if sold as “BI module”.

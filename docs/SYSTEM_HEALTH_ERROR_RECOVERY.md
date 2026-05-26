# System health & error recovery

## Workspace routes

- `/dashboard/system-health` — KPI rollup + links (uses `loadOperationHealth`).
- `/dashboard/system-health/data-integrity` — integrity drill-down.
- `/dashboard/error-recovery` — failed webhooks, integrations, imports, mapping backlog.

## Platform routes

- `/platform/system-health` — cross-tenant snapshot (`getPlatformDashboardSnapshot`).
- `/platform/error-recovery` — operator triage tiles.

## Actions

Retry webhooks, fix imports, resolve mapping — each deep links to owning module; destructive actions require confirmation.

## Priority

**P1** commercial MVP.

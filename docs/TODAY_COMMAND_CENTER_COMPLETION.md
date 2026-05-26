# Today command center — completion notes

## Files

| Path | Role |
|------|------|
| `services/today/today-command-center-service.ts` | Aggregates workspace KPIs, blockers, readiness. |
| `services/today/today-query-service.ts` | Operational counts (blocked orders approx, packing/production queues, confirmed pipeline). |
| `services/today/today-actions-service.ts` | Deep-link helpers for future mutations. |
| `lib/today/today-types.ts` | Re-exports payload types for consumers. |
| `lib/today/today-priorities.ts` | Priority constants for blocker ranking. |
| `components/dashboard/today-command-center.tsx` | UI (KPI grid, blockers, links). |
| `components/today/today-command-center.tsx` | Re-export shim for canonical path. |

## Enhancements shipped

- KPIs for **blocked orders (approx)**, **confirmed pipeline**, **packing queue**, **production work open**.
- Calmer empty state copy (**“Everything is calm today”**) with CTAs: create order, menu item, order hub, demo.
- Quiet detection now respects `blockedOrdersApprox`.

## Business modes

Mode hints still come from `dashboardModeSummaryLines` — deeper per-mode card layouts remain **P2**.

## Follow-ups (P2)

- Person-level assignment on cards (needs staff joins everywhere).
- Failed job replay buttons (requires job runner API surface).
- Cached KPI snapshots for very large workspaces.

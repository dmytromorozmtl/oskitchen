# Today command center

## Route

- `app/dashboard/today/page.tsx` loads `loadTodayCommandCenter` from `services/today/today-command-center-service.ts`.

## Implemented sections (data-backed)

- KPIs: orders due today, active orders, routes, webhooks, integrations, integrity counts, revenue week, etc.
- Blockers: mapping backlog, failed channel orders, integration errors, webhooks, pickup/dispatch hints, integrity.
- Orders due today, open tasks, routes today.
- Readiness: `computeWorkspaceReadiness`.
- **Live activity / presence:** UI shell components (`components/realtime/*`) with polling-first semantics.

## Target sections (brief gap list)

- Dedicated “integration issues” table (partially covered by KPIs + blockers).
- “AI suggested next actions” — wire `services/ai/recommendation-ai-service.ts` into view (server component fetch).

## Business modes

- `BUSINESS_TYPE_LABELS` + `dashboardModeSummaryLines` in `lib/business-modes.ts`.

## Priority

**P1** — connect AI recommendations + optional realtime channel.

# Core operational nervous system

## Code map

| Area | Path |
|------|------|
| Cross-module types | `lib/operations/operation-types.ts` |
| Health rollup | `lib/operations/operation-status.ts` |
| Priorities | `lib/operations/operation-priorities.ts` |
| Blocker mapping | `lib/operations/operation-blockers.ts` |
| Event vocabulary | `lib/operations/operation-events.ts` |
| Facade services | `services/operations/operation-service.ts`, `operation-blocker-service.ts`, `operation-health-service.ts` |

## Relationship to orders

Order-specific truth remains in `lib/orders/*` + `services/orders/*`. The operations layer **maps** order blockers into a cross-domain list for Today, health pages, and future executive dashboards.

## Next steps

- Have Today + Order Hub call `loadOperationsWorkspaceSnapshot` for a single triage payload (incremental refactor).

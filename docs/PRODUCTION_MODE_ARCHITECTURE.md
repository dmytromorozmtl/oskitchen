# Production mode architecture

Canonical implementation lives under `lib/production/`:

| File | Responsibility |
|------|----------------|
| `production-modes.ts` | `ProductionCommandMode` list, default mode per `BusinessType`, default stages/stations, empty-state copy. |
| `production-terminology.ts` | Dynamic page titles and task wording (Phase 18). |
| `production-status.ts` | Status labels, Kanban column order, `isWorkLate()`. |
| `production-priority.ts` | Priority helpers for work items. |
| `production-aggregation.ts` | KPI rollup from work items (includes late/risk via `dueAt`). |
| `production-capacity.ts` | Station overload heuristic for command-center badges. |

## Modes

Modes are enum values in Prisma (`ProductionCommandMode`), including:

- `DAILY_PREP`, `SERVICE_PREP`, `BATCH_PRODUCTION`, `WEEKLY_MEAL_PREP`, `EVENT_PRODUCTION`, `BAKERY_BATCH`, `BAR_PREP`, `CAFE_MORNING_PREP`, `GHOST_KITCHEN_RUSH`, `PACKING_HANDOFF`.

`defaultProductionModeForBusiness()` picks a sensible default when generating batches.

## Stages vs statuses

- **Kanban statuses** (`ProductionWorkStatus`): system-wide workflow (`TO_PREP` → `DONE`).
- **Stage strings** (`ProductionWorkItem.stage`): human-readable column hints (can align with `defaultStagesForMode()` presets).

Future: persist user stage presets in `ProductionStagePreset` and map to statuses.

## Handoff rules (target)

| Mode | Pack handoff emphasis |
|------|------------------------|
| `PACKING_HANDOFF` / meal prep / ghost | High — bulk pack lines |
| `BAR_PREP` | Lower — mostly mise and batched bev |
| `EVENT_PRODUCTION` | Trays + load-out |

Implement in generation service + optional automation when packing module exposes an API.

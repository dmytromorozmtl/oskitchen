# Production module — ready report

**Status:** Phase 1–4 partially complete; generation + command center + kitchen handoff shipped incrementally.

## What changed

1. **Prisma:** Additive models for batches, work items, stations, stage presets, work events, templates (enums for command mode, source, status, priority, event types).
2. **`lib/production/*`:** Modes, terminology, status, priority, aggregation (with late/risk via `dueAt`), capacity heuristics.
3. **`services/production/generate-production.ts`:** Menu + order generation with dedupe and audit logging.
4. **`actions/production.ts`:** Generate form actions (redirect + revalidate), work item status updates with audit, kitchen revalidation on bulk legacy updates.
5. **UI:** `ProductionCommandCenter` — KPIs, tabs, board, prep list, batch list, placeholders, business-aware empty state, embedded legacy table.
6. **Pages:** `/dashboard/production` wired to data; `/dashboard/production/reports` and `/templates` stubs; `/dashboard/kitchen` shows command-center lines.

## Modes supported

All `ProductionCommandMode` enum values; default per business type in `production-modes.ts`.

## Views

Board, prep list, timeline (placeholder), stations (placeholder), batches, orders source (placeholder), ingredients (placeholder), reports link + dedicated reports page stub.

## Generation engine

Menu prepared-date path and order-day path live; catering/forecast/manual expansions documented as next.

## Business modes

Terminology + empty states keyed off `KitchenSettings.businessType`.

## Integrations

- **Menus/products:** Menu generator.
- **Orders:** Order generator.
- **Kitchen screen:** Work item execution forms.
- **Packing/labels:** Flags + status handoff; auto packing task creation not yet wired.
- **Staff:** Schema supports assignees; UI pending.
- **Ingredients:** Planned (view placeholder).

## Remaining limitations

- Timeline, stations master UI, orders trace grid, ingredient MRP, template apply, role matrix, optimistic board moves, virtualization at extreme scale.
- Legacy `ProductionTask` and command `ProductionWorkItem` coexist intentionally.

## Recommendations (next sprint)

1. Role-gated mutations (P0).
2. Packing module callback when status `PACK_HANDOFF`.
3. Assignee picker + station CRUD.
4. Orders source view backed by `orderId` on work items.

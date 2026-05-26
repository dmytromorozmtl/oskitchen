# Production board view

**Route:** `/dashboard/production?view=board`

## Layout

Columns follow `BOARD_STATUS_ORDER` in `lib/production/production-status.ts` (excludes terminal states from main flow columns).

## Task card (current)

- Title, quantity, allergen badge.
- `Select` to change status → `updateProductionWorkItemStatusFormAction` + client `router.refresh()`.

## Planned card metadata

- Due time, source order/menu/event, brand badge, assignee avatar, priority chevron, packing/label icons, notes popover, drag between columns (optimistic + server patch).

## Custom stages

When `ProductionStagePreset` UI exists, columns can map presets to status groupings without breaking enum storage.

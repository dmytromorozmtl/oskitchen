# Kitchen Screen architecture

## Principles

- **Planning** lives in Production Command Center; **execution** on Kitchen Screen.
- Kitchen reads **mutable execution state** (`ProductionWorkItem`, `ProductionTask`) and never generates batches.

## Modules

| Path | Role |
|------|------|
| `lib/kitchen-screen/kitchen-screen-types.ts` | DTOs, mode union, bundle shape. |
| `lib/kitchen-screen/kitchen-screen-filters.ts` | Station slugs, mode filters, sort/late helpers, query normalizers. |
| `lib/kitchen-screen/kitchen-screen-actions.ts` | Which action buttons to show per status. |
| `lib/kitchen-screen/kitchen-screen-layouts.ts` | Business-mode titles + mode picker labels. |
| `services/kitchen-screen/kitchen-screen-service.ts` | Prisma load for bundle (work items, legacy tasks, staff, viewer staff id). |
| `components/dashboard/kitchen-screen-client.tsx` | Tablet UI, polling, URL state, cards. |

## Server actions (`actions/production.ts`)

- `updateProductionWorkItemStatusFormAction` — status changes, optional `appendNote`, audit, `SENT_TO_PACKING` event when entering `PACK_HANDOFF`.
- `assignProductionWorkItemStaffFormAction` — assignee + `REASSIGNED` work event + audit.

## Future reads

- `ProductionStation` / `ProductionStagePreset` for tab labels and capacity.
- `PackingEvent` / packing tasks when model exists.

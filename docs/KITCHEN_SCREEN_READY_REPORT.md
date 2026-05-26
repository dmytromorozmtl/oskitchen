# Kitchen Screen ready report

## What changed

- New **`KitchenScreenClient`** tablet-first UI: header metrics, station tabs, execution modes, fullscreen overlay, compact/large cards, polling refresh.
- **`loadKitchenScreenBundle`** aggregates work items (with order/brand/assignee), legacy open tasks, staff roster, “me” staff id via email match, platform bypass flag for empty-state CTAs.
- **Production actions** extended: optional `appendNote` on status updates; **`SENT_TO_PACKING`** work event on `PACK_HANDOFF`; **`assignProductionWorkItemStaffFormAction`** with audit + `REASSIGNED` event.
- **Route** `/dashboard/kitchen/fullscreen` → redirect with `fullscreen=1`.

## Modes supported

All modes listed in `KITCHEN_SCREEN_MODES.md` (filtering implemented for rush, packing, my_tasks, bar/bakery/meal_prep heuristics; event/batch reserved).

## Station support

Slug-based tabs + URL deep links; heuristic matching on free-text `station` field.

## Task actions

Start, ready, resume, hold (with reason), send to packing, complete, assign.

## Tablet UX

Large typography, touch targets, fullscreen kiosk shell, manual + auto refresh.

## Packing handoff

Status + audit event; packing module automation still **P0 follow-up**.

## Allergen / label

Prominent allergen banner; pack/label badges; compliance disclaimer in fullscreen.

## Permissions

OWNER vs STAFF messaging only; same server-side user scoping as production actions. Platform superadmin bypass unchanged via billing access flag for nav/extras (no secrets in UI).

## Performance

Bounded queries; client refresh strategy; no websockets.

## Limitations / next

- No `PackingEvent` auto-create; no label print; no sound; no wake lock; station list not yet DB-driven; `my_tasks` needs staff email alignment; granular kitchen-lead role not in schema.

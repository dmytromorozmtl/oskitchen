# Kitchen Screen integration

**Route:** `/dashboard/kitchen` · **Client:** `KitchenScreenClient` · **Data:** `loadKitchenScreenBundle`

## Roles

- **Command center** (`/dashboard/production`): planning, KPIs, batching, sources.
- **Kitchen screen**: gloves-on execution (tablet-first, URL-driven filters).

## Current integration

1. **Prep lines:** Open `ProductionWorkItem` rows with large cards, station tabs, execution modes, fullscreen overlay, assignee controls, hold reasons, and transitions:
   - Start → `IN_PROGRESS` → optional **Mark ready** (`READY`) → **Send to packing** (`PACK_HANDOFF`) → **Complete** (`DONE`)
   - **Hold** (`HOLD`) with `[Hold] …` note; **Resume** → `TO_PREP`
2. **Packing hook:** Entering `PACK_HANDOFF` writes `ProductionWorkEvent` (`SENT_TO_PACKING`).
3. **Legacy line:** `ProductionTask` cook/pack/label via `updateProductionTask` (unchanged semantics).

## Revalidation

`updateProductionWorkItemStatusFormAction`, `assignProductionWorkItemStaffFormAction`, bulk production updates, and generate actions revalidate `/dashboard/kitchen`.

## Roadmap

- Countdown timers per item
- Barcode scan to jump to item
- Packing module auto-queue from `SENT_TO_PACKING` events

# Kitchen Screen packing handoff

## Flow

1. Task with `requiresPacking` moves to **`PACK_HANDOFF`** via **Send to packing**.
2. Server creates **`ProductionWorkEvent`** (`SENT_TO_PACKING`) with actor + metadata.
3. Task can be marked **`DONE`** after physical handoff (**Complete handoff**).

## Traceability

`orderId` / `orderItemId` remain on `ProductionWorkItem` for packing module consumption.

## Next

- Mirror into `PackingEvent` or packing queue model.
- Show packing lane status on card (read-only) when packing module exposes API.

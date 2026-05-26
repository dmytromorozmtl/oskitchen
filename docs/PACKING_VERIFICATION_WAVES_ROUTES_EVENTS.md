# Waves, routes, and event loadout verification

## Schema readiness

`PackingVerificationSession` optional FKs:

- `packingBatchId`
- `packingWaveId`
- `routeId`
- `eventId` (when catering/event model is linked)

Modes include `WAVE_VERIFY`, `ROUTE_VERIFY`, `EVENT_LOADOUT_VERIFY`, `PICKUP_HANDOFF_VERIFY`, `DELIVERY_HANDOFF_VERIFY`.

## Current product behavior

The console exposes **tabs** for Waves / Routes / Issues / Audit. **Order-level verification** is the implemented workflow: scan token → start session → line checklist.

## Target behavior (implementation checklist)

### Wave

- List orders in wave (`PackingWave` → orders/tasks).
- Per-order progress bar; drill into order session.

### Route

- List delivery orders on route; manifest vs scanned bags.
- Driver handoff: `DELIVERY_HANDOFF_VERIFY` when route close-out is required.

### Event / loadout

- Catering trays, supplies, setup checklist lines as synthetic `PackingVerificationItem` rows or linked BOM lines.

## Indexes

Prisma migration adds indexes on `orderId`, `sessionId`, statuses, `packingWaveId`, `routeId`, `eventId`, `scannedAt` where applicable for reporting scale.

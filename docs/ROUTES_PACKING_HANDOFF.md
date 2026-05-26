# Routes ↔ Packing handoff

## Relationship

`PackingBatch.routeId`, `PackingWave.routeId`, `PackingTask.routeId`, and `PackingVerificationSession.routeId` already point to `DeliveryRoute`. The route detail and manifest pages expose `packingStatus` per stop (column added to `DeliveryStop`) so dispatch can see readiness without leaving Routes.

## Readiness rules

- A stop **should not** advance past `READY` until packing reports it packed and (when relevant) verified.
- `canTransitionStop` allows the transition but UI should warn — readiness gating is a UI concern handled in the stop status form.
- Override remains possible because emergencies happen; the override is captured as a `DeliveryEvent` (`STOP_LOADED` / `STOP_OUT_FOR_DELIVERY` with `performedBy`).

## Reverse update

Packing verification flows can call into `services/routes/route-service.ts → updateStopStatus` (or directly update the stop) to bump `packing_status` and route counts. The current admin UI updates statuses manually; the verification-driven sync is a follow-up.

## Manifest

The driver manifest shows packing status alongside customer + notes so a missing pack label is visible before loadout.

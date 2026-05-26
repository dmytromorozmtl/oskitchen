# Packing route handoff

## Current

- `PackingTask.routeId` nullable; generator does not auto-assign.
- **By route** tab groups tasks by `routeLabel` derived from `DeliveryRoute` (`driverName`, `routeDate`) when linked.

## Planned

- Pull `DeliveryStop` for order → default `routeId`.
- Actions: **Assign route**, **Print driver manifest**, **Mark ready for delivery**.
- Pickup shelf / staging placeholders in UI copy.

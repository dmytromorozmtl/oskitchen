# Production stations view

**Route:** `/dashboard/production?view=stations`

## Goal

Workload by station: open task count, estimated minutes, completion %, overload warnings, assigned staff, station notes.

## Current

Static explainer referencing `production_stations` table.

## Next steps

1. CRUD UI for `ProductionStation`.
2. Aggregate open `ProductionWorkItem` by normalized station key matching `ProductionStation.name` or `type`.
3. Use `stationOverloadWarnings` with real `capacityUnits` map instead of default ratio.

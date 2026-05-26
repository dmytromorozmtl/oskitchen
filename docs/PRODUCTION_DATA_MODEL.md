# Production data model

## Command center (new)

- **`ProductionBatch`**: Day bucket, mode, source type, counts, optional brand/location/menu/order links, assignee.
- **`ProductionWorkItem`**: Executable line — quantity, station, stage, status, priority, due times, packing/label flags, allergen text, optional order/orderItem/product links.
- **`ProductionStation`**: Master station list (capacity, sort order).
- **`ProductionStagePreset`**: Per-user stage columns by mode.
- **`ProductionWorkEvent`**: Append-only audit (`eventType`, `performedBy`, `metadataJson`).
- **`ProductionTemplate`**: Saved workflow JSON (stages, stations, tasks).

## Legacy execution (unchanged)

- **`ProductionTask`**: Per-product cook/pack/label flags; continues to power existing product-centric flows and packing expectations.

## Indexes

See Prisma schema: composite indexes on `(userId, productionDate)`, brand/location + date, status, station, assignee, orders.

## Migration safety

Additive migration only — no destructive drops of legacy `production_tasks` or historical rows.

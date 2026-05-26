# Packing waves

## Model

`PackingWave` — `title`, `packingDate`, optional `fulfillmentType`, optional `routeId`, `status` (reuses `PackingBatchStatus` enum in DB).

## UI

`/dashboard/packing` → **Waves** tab:

- Create wave form (`createPackingWaveAction`).
- List waves with task counts (`_count.tasks`).

## Next steps (P1)

- Assign tasks to wave (`waveId` update on `PackingTask`).
- Wave-level PDF/CSV + send subset to Packing Verify.
- Progress bar from packed/verified counts per wave.

# Production batches view

**Route:** `/dashboard/production?view=batches`

## Use cases

Bakery dough runs, sauce batches, meal-prep cook waves, catering tray counts, batched cocktails.

## Current

Lists `ProductionBatch` for the selected `productionDate`: title, mode, status, completed/total counts.

## Planned fields in UI

- Yield vs required quantity, waste buffer %, recipe deep link, ingredient demand summary, batch sheet print, parallel sub-tasks per batch.

Generation service already creates a MENU or ORDER sourced batch per run when items exist.

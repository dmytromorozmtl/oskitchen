# Production generation engine

**Module:** `services/production/generate-production.ts`

## Implemented generators

1. **`generateProductionFromMenuProducts`**
   - Input: `userId`, `productionDate`, optional `mode`, `businessType`.
   - Selects active products whose `preparedDate` falls on that calendar day (user’s menu scope).
   - Skips if an open MENU-sourced work item already exists for the same product.
   - Creates `ProductionBatch` + `ProductionWorkItem` rows + `ProductionWorkEvent` CREATED entries.
   - Deletes empty batch if nothing created.

2. **`generateProductionFromOrdersForDate`**
   - Creates ORDER-sourced lines from open orders for the day (see implementation for date matching rules).
   - Dedupes against existing open ORDER lines for same order item.

## Audit

`recordAuditLog` when new items are created (see service).

## Planned extensions

- Catering quotes / events → `CATERING_EVENT` source.
- Forecast → `FORECAST` source.
- Manual quick-add API.
- Brand/location scoped runs.

Server entrypoints: `generateProductionMenuPrepFormAction`, `generateProductionOrdersFormAction` in `actions/production.ts` (redirect + revalidate production + kitchen).

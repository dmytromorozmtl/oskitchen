# Purchasing ↔ ingredient demand

- Overview KPIs and supplier/shortage cards still use `loadDemandCommandCenterPayload` (same engine as `/dashboard/inventory/demand`).
- `?demandRun=` continues to show linked run banner.
- “Generate from demand” seeds the **reorder queue** from **live** shortage lines (not only saved run lines) to avoid blocking on persisted runs.

Deep link to create draft PO lines from a specific `IngredientDemandRun` + `demandRunLineId` is the next integration step.

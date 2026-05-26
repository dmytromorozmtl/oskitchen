# Demand ↔ purchasing integration

- **Shared rollup:** Purchasing (`/dashboard/purchasing`) calls `loadDemandCommandCenterPayload`, identical math to Ingredient Demand.
- **Traceability:** Optional query `?demandRun=<uuid>` shows a linked-run banner when the UUID belongs to the signed-in user.
- **CSV:** Still generated client-side from rolled rows — column order unchanged.
- **Runs:** Saving a run (`runDemandCalculationAndSaveAction`) writes `IngredientDemandRun` + `IngredientDemandRunLine` for audit / future PO drafts.

No automatic purchase order creation — existing purchasing flows stay manual-safe.

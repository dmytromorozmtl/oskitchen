# Demand ↔ production integration

**Feeding demand:** `PRODUCTION_PLAN` source includes `ProductionWorkItem` rows with a `batchId`, non-`CANCELLED` status, and batches in `DRAFT` or `ACTIVE` within the selected date window.

**Future UI hooks (recommended):**

- Production Command Center: deep-link to `/dashboard/inventory/demand?dateFrom=…&dateTo=…` with sources prefilled (query contract TBD).
- Batch detail: show “Ingredient demand generated” when a linked `IngredientDemandRun` references batch IDs in JSON (not yet stored per batch — extend `sourceSummaryJson` when needed).

This iteration wires **data only**; production screens were not refactored to avoid regressions.

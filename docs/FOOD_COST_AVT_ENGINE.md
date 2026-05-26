# Food Cost — Actual vs Theoretical (AvT) Engine

## Honesty principle

KitchenOS must **never** fabricate actual inventory precision. Reports show a **confidence** badge:

- **HIGH:** active recipes **and** receiving history (`receivingEvent` rows).  
- **MEDIUM:** recipes without enough receiving signal.  
- **LOW:** missing recipe/cost coverage.

## Code

- Summary service: `services/costing/actual-vs-theoretical-service.ts` (`summarizeActualVsTheoretical`).  
- Full costing run: `services/costing/costing-service.ts` + `lib/costing/*`.  
- Recipes: `services/inventory/recipe-service.ts`.  
- Demand: `services/inventory/ingredient-demand-service.ts`.  
- Purchasing / PO / receiving: `services/inventory/*`.

## Roadmap (P1/P2)

- Variance by SKU and by ingredient charts once receiving cadence stable.  
- Supplier price drift alerts (partially in margin services today).

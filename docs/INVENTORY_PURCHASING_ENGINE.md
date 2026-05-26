# Inventory & purchasing engine

## Pipeline

Menu items → recipes → orders → ingredient demand → purchasing → receiving → costing/margin.

## Key services

- Demand: `services/ingredient-demand/demand-service.ts` (re-exported as `services/inventory/ingredient-demand-service.ts`).
- Recipes: `services/inventory/recipe-service.ts`.
- Suppliers: `services/inventory/supplier-service.ts`.
- Purchase orders: `services/inventory/purchase-order-service.ts`.
- Receiving: `services/inventory/receiving-service.ts`.
- Margin signals: `services/costing/margin-service.ts` (executive overview).

## Gaps

Automated PO approval chains, supplier price drift alerts, and receiving discrepancy workflows are **incremental** features.

## Priority

**P1** for commissary / high-SKU operators.

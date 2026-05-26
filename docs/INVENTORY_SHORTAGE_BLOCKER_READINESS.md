# Inventory shortage blocker readiness

## Policy

`INVENTORY_SHORTAGE` is **not** attached to orders until real demand, stock, recipes, and thresholds exist.

## Implementation

- `lib/inventory/shortage-confidence.ts` — READY / PARTIAL / NOT_CONFIGURED copy.
- `services/inventory/inventory-shortage-readiness-service.ts` — counts recipes, `inventory_stock` rows, `ingredient_demand_run` rows.
- Surfaces: Today command center card + Data integrity page banner + **Purchasing** hub card with links to demand and suppliers.

## Future

Promote to blockers only when deterministic shortage math and operator-approved thresholds ship.

# POS — Kitchen Routing

## Rules (`lib/pos/pos-routing-rules.ts`)

`posRoutingForProductCategory` returns a `PosKitchenRoute` enum:

- `BEVERAGES` → `NO_KITCHEN_REQUIRED` (counter pickup, no cook ticket).
- `SIDES`, `BAKERY` → `READY_NOW` (skip automatic production enqueue; operators may still prep manually).
- Default categories → `SEND_TO_KITCHEN`.

Extend this table as you add richer `ProductCategory` values or per-product flags (e.g., `madeToOrder`).

## Service (`pos-kitchen-routing-service.ts`)

1. Loads order + items + products.
2. Filters **eligible** lines where routing is neither `NO_KITCHEN_REQUIRED` nor `READY_NOW`.
3. Creates a `ProductionBatch` tied to the order + `ProductionWorkItem` rows (`sourceType: ORDER`, `station: "POS"`).
4. Sets `requiresPacking` when route is `SEND_TO_PACKING`, `SEND_TO_PRODUCTION_LATER`, or `CUSTOM`.
5. Deletes empty batches if no work items materialized.

## Operational notes

- Routing is **best-effort**; stations still follow your existing production UI discipline.
- POS does not auto-complete grab-and-go orders in the DB — configure operational SOPs or future automation if you need instant `COMPLETED` without kitchen.

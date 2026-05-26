# Location assignment tools

Route: `/dashboard/locations/assignment`

## Why this exists

Most KitchenOS workspaces existed before the Location concept matured. Rows
across Menus, Orders, Brands, Production, Packing, Routes, Inventory, POs,
and Tasks were created with `locationId = null`. This page lets operators
tag them in bulk without writing SQL — and **never** destructively migrates.

## How it works

1. The page loads the first 100 unassigned rows per supported target.
2. The `<AssignmentForm>` client component holds selected ids + chosen
   location in local state.
3. Submit calls the `bulkAssignAction` server action.
4. The service-layer helper `bulkAssignToLocation()` iterates row-by-row:
   - Confirms ownership (`userId` match) for every row.
   - Updates `locationId`.
   - Writes a `LocationAssignmentEvent` row capturing the prior location.
5. The page revalidates and refreshes the unassigned counts.

## Supported targets

| Target enum | Model | Notes |
|-------------|-------|-------|
| `MENU` | `Menu` | Editable from page |
| `ORDER` | `Order` | Editable from page |
| `BRAND` | `Brand` | Scoped via `workspace.ownerUserId` |
| `PRODUCTION_BATCH` | `ProductionBatch` | Editable |
| `PRODUCTION_WORK_ITEM` | `ProductionWorkItem` | Action ready, no UI yet |
| `PACKING_BATCH` | `PackingBatch` | Editable |
| `PACKING_TASK` | `PackingTask` | Action ready, no UI yet |
| `DELIVERY_ROUTE` | `DeliveryRoute` | Editable |
| `INVENTORY_STOCK` | `InventoryStock` | Editable |
| `PURCHASE_ORDER` | `PurchaseOrder` | Editable |
| `KITCHEN_TASK` | `KitchenTask` | Editable |
| `MENU_ITEM` | n/a yet | Reserved for a future pass |
| `PROFITABILITY_LINE` | n/a yet | Reserved |
| `CATERING_EVENT` | n/a yet | Reserved |

## Clearing an assignment

Selecting the empty option (`"Clear location"`) sets `locationId = null`. The
audit event still fires with `fromLocationId` populated so you can trace it.

## Safety

- Selecting **0 rows** is rejected client-side (`Pick at least one row.`).
- Cross-workspace writes are blocked by `findFirst({ userId: scope.userId })`.
- Failures inside the loop are counted as `skipped` — the rest of the batch
  still applies.
- Every event is in `location_assignment_events` with `created_at` indexed.

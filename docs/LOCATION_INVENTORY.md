# Location inventory

`InventoryStock` has carried `locationId String?` for a long time — the
Location Management Center surfaces it.

## Detail tab

`/dashboard/locations/[id]/inventory` lists the 80 most recently updated
stock rows scoped to the location, with the joined ingredient name. Rows
with `quantityOnHand <= 0` get a red row highlight.

## Aggregation when no location is selected

Other modules already query `InventoryStock` with mixed `locationId` —
nothing changes. When the global switcher is "All locations" the existing
queries continue to aggregate across rows.

When a single location is selected, modules can opt-in to scoping:

```ts
const where = {
  userId,
  ...(await locationContextFilter()),
};
const stock = await prisma.inventoryStock.findMany({ where });
```

## Shortages KPI

`/dashboard/locations/[id]/reports` exposes "Inventory shortages" as the
count of rows where `quantityOnHand <= 0`. Future work can move that
threshold into `inventory_settings_json` (e.g. `lowStockThreshold`).

## Assignment

The Assignment tools page exposes "Unassigned inventory" with the same
bulk-assign workflow as menus / orders / routes. Tagged stock rows can
then drive per-location reorder reports.

## Purchasing

`PurchaseOrder` also carries `locationId`; the same Assignment row lets
operators link POs to a specific location for landed-cost analysis.

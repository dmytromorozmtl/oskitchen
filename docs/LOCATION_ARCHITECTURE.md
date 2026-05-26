# Location architecture

## Data model

```
Location                            (extended additively)
└─ LocationAssignmentEvent          (new audit-only table)
```

### New columns on `locations`

`slug`, `type` (new `LocationType` enum), `status` (new `LocationStatus` enum),
`phone`, `email`, `manager_name`, `business_hours_json`, `pickup_hours_json`,
`delivery_hours_json`, `closures_json`, `fulfillment_settings_json`,
`delivery_zones_json`, `capacity_settings_json`, `kitchen_stations_json`,
`inventory_settings_json`, `tax_settings_json`, `notes`, `sort_order`,
`default_brand_id`, `default_storefront_id`.

`active` is preserved for backwards compatibility; status `ARCHIVED`
supersedes it.

### Enums (new)

- `LocationType` — RESTAURANT, CAFE, BAR, BAKERY, CATERING_KITCHEN, COMMISSARY, GHOST_KITCHEN, CLOUD_KITCHEN, PICKUP_POINT, DELIVERY_HUB, WAREHOUSE, EVENT_KITCHEN.
- `LocationStatus` — ACTIVE, SETUP, PAUSED, TEMPORARILY_CLOSED, ARCHIVED.
- `LocationAssignmentTarget` — MENU, MENU_ITEM, ORDER, BRAND, PRODUCTION_BATCH, PRODUCTION_WORK_ITEM, PACKING_BATCH, PACKING_TASK, DELIVERY_ROUTE, INVENTORY_STOCK, PURCHASE_ORDER, KITCHEN_TASK, PROFITABILITY_LINE, CATERING_EVENT.

### Indexes

`(user_id, slug)` unique, `(user_id, status)`, `type`, `timezone`, plus the
existing `user_id`. All added with `IF NOT EXISTS` for safe re-runs.

## Layers

```
app/dashboard/locations/*             ← UI (RSC + small client components)
   └─ uses
actions/locations.ts                  ← server actions (legacy + new)
   └─ delegates to
services/locations/location-service.ts ← business logic
   └─ uses
lib/locations/*                       ← pure helpers (types, status, hours, fulfillment, permissions, context)
```

## Cross-module touch points

These models already carry `locationId String?` (additive earlier — preserved):

- `Menu`, `Order`, `Brand`
- `ProductionBatch`, `ProductionWorkItem`, `ProductionStation`
- `PackingBatch`, `PackingTask`
- `ChannelOrder`
- `InventoryStock`, `PurchaseOrder`
- `DeliveryRoute`, `ProfitabilityLine`
- `KitchenTask`

All keep `locationId` **nullable** — existing unscoped rows continue to work.

## Why JSON for hours / fulfillment / capacity

Hours and fulfillment evolve faster than the database. Storing them as JSON
keeps the migration footprint minimal and gives us schema-on-read in `lib/`
(`parseWeeklyHours`, `parseFulfillmentSettings`, …) which is forgiving by
design. We get strong typing on read without rebuilding the table when a new
field lands.

## LocationAssignmentEvent

Every bulk assignment writes a row:

```
{
  userId,
  locationId: <target> | null (= cleared),
  fromLocationId: <previous>,
  target: "MENU" | "ORDER" | ...,
  targetId,
  performedBy,
  metadataJson?
}
```

Indexed on `(userId, createdAt)`, `(locationId, createdAt)`, and
`(target, targetId)` so we can answer "show me everything moved into Brand X
last week".

## Global switcher (cookie)

Source of truth lives in `lib/locations/location-context.ts`. Pages anywhere
in the app can do:

```ts
const ctx = await readLocationContext();
const filter = await locationContextFilter("locationId");
const orders = await prisma.order.findMany({ where: { userId, ...filter } });
```

— and stay correct for both "all locations" and a single-location workspace.

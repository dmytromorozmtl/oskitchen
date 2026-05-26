# Location Management Center

`/dashboard/locations` is the Location Management Center. The legacy
two-field form is preserved on the overview page; everything else lives in
sibling routes wired by the subnav.

## Routes

| Route | Purpose |
|-------|---------|
| `/dashboard/locations` | Overview: KPIs + cards + quick-add + unassigned summary |
| `/dashboard/locations/active` | Filtered list of `ACTIVE` rows |
| `/dashboard/locations/setup` | Setup / paused / closed rows with a setup checklist |
| `/dashboard/locations/new` | Full new-location wizard (basics + address) |
| `/dashboard/locations/templates` | Starter templates (restaurant / café / bar / bakery / catering / ghost / hub / commissary) |
| `/dashboard/locations/assignment` | Bulk-assign unassigned rows to a location |
| `/dashboard/locations/reports` | Cross-location 30-day comparison |
| `/dashboard/locations/settings` | Switcher state, access, data safety summary |
| `/dashboard/locations/[id]` | Detail layout — sub-tabs below |

## Detail tabs (`/dashboard/locations/[id]/...`)

| Tab | Path | Notes |
|-----|------|-------|
| Overview | `/` | KPIs + next-best-action |
| Profile | `/profile` | Editable name, type, status, contact, address, default brand, danger zone |
| Hours | `/hours` | Business / pickup / delivery weekly editors |
| Fulfillment | `/fulfillment` | Pickup + delivery enabled, lead times, cutoffs, fees, min order, max-per-window |
| Brands | `/brands` | Brands operating here (default brand pinned on profile) |
| Menus | `/menus` | Menus assigned to this location |
| Orders | `/orders` | Recent orders for the location |
| Production | `/production` | Production batches for the location |
| Routes | `/routes` | Delivery routes starting here |
| Inventory | `/inventory` | Stock on hand with low-stock highlight |
| Reports | `/reports` | 30-day KPIs scoped to the location |
| Settings | `/settings` | Assignment audit log + archive |

## KPIs on the overview

- Active locations
- In setup
- With orders today
- Missing hours
- Missing address
- With delivery zones
- Unassigned records (sum across menus / orders / brands / batches / routes / stock / POs / tasks)
- Total locations

All counts come from `services/locations/location-service.ts → loadLocationOverviewKpis()`
plus a single Order `groupBy` for the "with orders today" metric.

## Backwards compatibility

- The legacy form (`createLocationFormAction`) still works unchanged.
- Existing `Location` rows are migrated in-place with default `type=RESTAURANT`, `status=ACTIVE`, `sort_order=0`.
- Existing rows on other models with `locationId=null` keep working everywhere.

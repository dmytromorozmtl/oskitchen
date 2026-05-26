# Locations ready report

The basic 2-field `/dashboard/locations` form has been promoted to a full
**Location Management Center** without breaking any existing surface area.

## What changed

### Database (additive, deployed via `db:deploy`)

- New enums: `LocationType`, `LocationStatus`, `LocationAssignmentTarget`.
- Extended `locations` with: `slug`, `type`, `status`, `phone`, `email`,
  `manager_name`, `business_hours_json`, `pickup_hours_json`,
  `delivery_hours_json`, `closures_json`, `fulfillment_settings_json`,
  `delivery_zones_json`, `capacity_settings_json`, `kitchen_stations_json`,
  `inventory_settings_json`, `tax_settings_json`, `notes`, `sort_order`,
  `default_brand_id`, `default_storefront_id`.
- Unique index `(user_id, slug)`; secondary indexes on `(user_id, status)`,
  `type`, `timezone`.
- New table `location_assignment_events` with FKs back to `users` (cascade)
  and `locations` (set-null), indexed on `(user_id, created_at)`,
  `(location_id, created_at)`, and `(target, target_id)`.
- Migration: `prisma/migrations/20260511220000_locations_management_center/`.

### Code

- `lib/locations/*` — `location-types`, `location-status`, `location-hours`,
  `location-fulfillment`, `location-permissions`, `location-context`.
- `services/locations/location-service.ts` — create / read / update /
  archive, bulk assignment with audit, KPI loader, unassigned counters.
- `actions/locations.ts` — legacy `createLocationFormAction` preserved; ten
  new server actions (full create, profile, hours, fulfillment, archive,
  bulk assign, switcher).

### UI

- New `LocationsSubnav` + `LocationSwitcher` + `LocationBadge` components.
- New `/dashboard/locations/*` route family: overview, active, setup, new,
  templates, assignment, reports, settings, and `[locationId]` with 12
  sub-tabs.
- Switcher wired into the Locations layout; ready to drop into other modules.

### Docs (in `docs/`)

`LOCATIONS_MODULE_AUDIT.md`, `LOCATION_ARCHITECTURE.md`,
`LOCATION_MANAGEMENT_CENTER.md`, `LOCATION_DETAIL_PAGE.md`,
`GLOBAL_LOCATION_SWITCHER.md`, `LOCATION_ASSIGNMENT_TOOLS.md`,
`LOCATION_HOURS_AND_CLOSURES.md`, `LOCATION_FULFILLMENT_SETTINGS.md`,
`LOCATION_INVENTORY.md`, `LOCATION_ROUTES.md`,
`LOCATION_STOREFRONT_SUPPORT.md`, `LOCATION_REPORTING.md`,
`LOCATION_QA_CHECKLIST.md`, `LOCATIONS_READY_REPORT.md`.

## Compatibility guarantees honoured

- Legacy 2-field form continues to work and lives on the overview as
  "Quick add".
- The existing `PlanGate(feature="multi_location")` still wraps the page.
- Existing `Location.active` boolean preserved alongside the new `status`
  enum.
- Every model with `locationId String?` keeps its rows valid — assignment is
  opt-in.
- No row deletion. Archive is the only destructive verb and it's a soft
  status change.

## Views added

| View | Route |
|------|-------|
| Overview | `/dashboard/locations` |
| Active | `/dashboard/locations/active` |
| Setup | `/dashboard/locations/setup` |
| New | `/dashboard/locations/new` |
| Templates | `/dashboard/locations/templates` |
| Assignment | `/dashboard/locations/assignment` |
| Cross-location reports | `/dashboard/locations/reports` |
| Module settings | `/dashboard/locations/settings` |
| Detail Overview | `/dashboard/locations/[id]` |
| Profile | `/dashboard/locations/[id]/profile` |
| Hours | `/dashboard/locations/[id]/hours` |
| Fulfillment | `/dashboard/locations/[id]/fulfillment` |
| Brands | `/dashboard/locations/[id]/brands` |
| Menus | `/dashboard/locations/[id]/menus` |
| Orders | `/dashboard/locations/[id]/orders` |
| Production | `/dashboard/locations/[id]/production` |
| Routes | `/dashboard/locations/[id]/routes` |
| Inventory | `/dashboard/locations/[id]/inventory` |
| Reports (detail) | `/dashboard/locations/[id]/reports` |
| Settings (detail) | `/dashboard/locations/[id]/settings` |

## Switcher

`LocationSwitcher` + `readLocationContext()` + `locationContextFilter()`
ship now. Wiring it into Orders, Menus, Production, Packing, Routes, Tasks,
Inventory, Purchasing, and Reports is a one-liner per query — the helper
returns `{}` when "All locations" is selected so it composes cleanly.

## Remaining limitations

1. **Staff ↔ location join** — `StaffMember` has no `locationId` yet. Per
   spec we deferred this to avoid touching staff permissions in the same
   pass.
2. **Delivery zone editor + closure editor** — schema in place, UI in a
   follow-up.
3. **Capacity / kitchen station editor** — JSON parsers ready (`parseCapacitySettings`,
   `parseKitchenStations`), editor still pending.
4. **Storefront location picker** — schema link present
   (`Location.default_storefront_id`), but the customer-facing picker on
   `/s/[storeSlug]` is a follow-up.
5. **Per-template seeded hours / fulfillment defaults** — templates page
   currently seeds only `type`; the rest is a fast follow-up.
6. **Multi-location RBAC** — `LocationActorScope.allowedLocationIds` is in
   `lib/locations/location-permissions.ts`. Wiring it to `WorkspaceMember`
   lands with the next RBAC pass.

## Next recommendations

- Drop the switcher into the top-level dashboard, Orders, Production,
  Packing, Routes, Tasks, Inventory, Purchasing, and Reports pages with
  `locationContextFilter()` on their main queries.
- Backfill defaults: pre-fill `status` and `type` per existing row from the
  workspace business type, plus a default sortOrder.
- Add the storefront picker on `/s/[storeSlug]`.
- Wire StaffMember.locationId once WorkspaceMember.role lands.
- Surface "closed now" and "missing hours" badges across Order Hub + Today
  Board.

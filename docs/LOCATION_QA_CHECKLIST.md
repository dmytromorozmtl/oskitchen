# Locations QA checklist

## Backwards compatibility

- [x] Legacy `/dashboard/locations` quick-add form still creates a location.
- [x] `createLocationFormAction` signature preserved.
- [x] Existing `Location` rows are migrated in-place with defaults (`type=RESTAURANT`, `status=ACTIVE`, `sort_order=0`).
- [x] Existing rows on Menu / Order / Brand / Production / Packing / Routes / Inventory / Purchasing / Tasks with `locationId=null` continue to work.
- [x] `app/dashboard/calendar`, `app/dashboard/executive`, `app/dashboard/reports/enterprise` queries unchanged.
- [x] `PlanGate(feature="multi_location")` continues to gate the page.

## New surface

- [ ] `/dashboard/locations` overview renders KPIs + cards.
- [ ] `/dashboard/locations/active` lists active locations.
- [ ] `/dashboard/locations/setup` lists setup / paused / temporarily-closed with checklists.
- [ ] `/dashboard/locations/new` creates a location with type / status / address.
- [ ] `/dashboard/locations/templates` lists starter templates.
- [ ] `/dashboard/locations/assignment` lets you bulk-assign menus, orders, brands, production, packing, routes, inventory, POs, tasks.
- [ ] `/dashboard/locations/reports` shows the 30-day cross-location table.
- [ ] `/dashboard/locations/settings` shows switcher state + access summary.
- [ ] `/dashboard/locations/[id]` detail layout renders header + sub-tabs.
- [ ] Profile tab edits name, type, status, contact, address, default brand, notes.
- [ ] Hours tab saves business / pickup / delivery weekly hours independently.
- [ ] Fulfillment tab saves the pickup / delivery JSON.
- [ ] Brands, Menus, Orders, Production, Routes, Inventory, Reports tabs render scoped lists.
- [ ] Detail Settings tab shows the assignment audit log.

## Switcher

- [ ] Switcher hidden when ≤1 location.
- [ ] Switcher visible and persistent (cookie) when ≥2 locations.
- [ ] "All locations" mode returns the empty filter from `locationContextFilter`.
- [ ] Single-location mode returns the `{ locationId }` filter.

## Assignment

- [ ] Selecting rows + "Assign" updates `locationId` on the right table.
- [ ] Selecting "Clear location" sets `locationId = null` and records the prior location.
- [ ] An audit event lands in `location_assignment_events` per row.
- [ ] Cross-workspace ids return `{ assigned: 0, skipped: n }` (ownership guard).

## Data safety

- [ ] Archive moves status to `ARCHIVED` without deleting rows.
- [ ] An archived location is still readable from its detail URL.
- [ ] Foreign rows pointing to an archived location continue to work.
- [ ] `Prisma.JsonNull` is used (not `null`) where a JSON field is being cleared.

## Build

- [x] `npm run typecheck` passes.
- [ ] `npm run build` passes.

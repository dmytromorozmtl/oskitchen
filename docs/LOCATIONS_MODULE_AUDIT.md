# Locations module audit (OS Kitchen)

**Date:** 2026-05-11
**Scope:** `/dashboard/locations`, `actions/locations.ts`, Prisma `Location`, every model that already carries an optional `locationId` (Menu, Order, ProductionBatch/WorkItem/Station, PackingBatch/Task, ChannelOrder, InventoryStock, PurchaseOrder, KitchenTask, DeliveryRoute, ProfitabilityLine, CateringEvent, Brand), plus storefront / staff / sales-channel references.

## TL;DR

`Location` exists with just `name + timezone + addressJson + active`. 14 other models already carry `locationId String?` but there is no UI to assign rows, no detail page, no hours, no fulfillment, no switcher, no staff link, and no reports. The existing route renders a 3-field form and a list of cards. Everything in this audit is **additive** — no destructive change to existing rows.

## Findings

| # | Area | Current state | Limitation | Affected types | Recommended fix | Pri |
|---|------|---------------|-------------|----------------|------------------|-----|
| 1 | UI | One form + flat list at `/dashboard/locations` | No KPIs, tabs, switcher, detail page, hours, fulfillment, brands, staff, reports | All | Management Center with subnav + detail tabs + wizard | P0 |
| 2 | Location model | `name, timezone, address_json, active` | Missing `slug`, `type`, `status`, `phone`, `email`, `manager_name`, hours JSONs, fulfillment JSON, capacity JSON, kitchen stations JSON, inventory settings JSON, tax JSON, default brand/storefront, notes, sort | All | Additive columns + new enums `LocationType`, `LocationStatus` | P0 |
| 3 | Type / status | None | Can't distinguish kitchen vs pickup point vs delivery hub; can't pause without deleting | Ghost / cloud / multi-brand / catering | Enums + filter UI | P0 |
| 4 | Hours / closures | None | Storefront, Order Hub, Routes need open/closed windows | All | `business_hours_json`, `pickup_hours_json`, `delivery_hours_json`, `closures_json` | P1 |
| 5 | Fulfillment | Mostly lives on `StorefrontSettings` and `DeliveryZone` today | Cannot configure per-location pickup / delivery cutoffs / min order | Multi-location, ghost | `fulfillment_settings_json` on Location; storefront can override | P1 |
| 6 | Capacity / stations | Only `ProductionStation` table | No high-level station map per location | Restaurant / catering / commissary | `kitchen_stations_json` (lightweight; full ProductionStation stays) | P2 |
| 7 | Brand link | Brand has `locationId String?` and `brands Brand[]` on Location | No "default brand" + no UI to manage | Ghost / cloud | Add `default_brand_id` on Location | P1 |
| 8 | Storefront link | StorefrontSettings is per-user / per-workspace today | Can't say which Location backs the storefront | Multi-location | Add `default_storefront_id` on Location (nullable, doesn't require FK on the storefront side) | P2 |
| 9 | Switcher | None | Every page shows all rows | Multi-location | `lib/locations/location-context.ts` (cookie) + `LocationSwitcher` | P0 |
| 10 | Assignment tools | None | Existing rows with `locationId=null` are stranded | All upgrading from single-location | `/dashboard/locations/assignment` page + bulk-assign server actions | P0 |
| 11 | Audit trail | None | Can't see who tagged what when | Multi-location | `LocationAssignmentEvent` (new table) | P1 |
| 12 | Staff link | None — `StaffMember` has no `locationId` | Can't see "who works where" | Multi-location | Phase-2: add nullable column; not in this pass to avoid touching staff permissions | P2 |
| 13 | Reports | None | No revenue-by-location, orders-by-location panel | Multi-location | `/dashboard/locations/[id]/reports` + service that already aggregates from Order + KitchenTask + DeliveryRoute | P1 |
| 14 | Empty states | "Single-location shops can ignore this" | Doesn't guide single-location operators (still useful for hours / pickup) | Single-location | Business-mode-aware empty state + setup checklist | P1 |
| 15 | Permissions | `requireSessionUser` only — workspace owner has everything | No per-location gating | Multi-location | `lib/locations/location-permissions.ts` + helper queries to gate by `locationId IN allowed` | P1 |
| 16 | Mobile usability | OK, but no station / capacity / hours editor | Drivers / managers want to flip hours quickly on phones | All | Compact forms in the new detail tabs | P2 |
| 17 | Tax settings | None | Real tax engine lives elsewhere; need a JSON placeholder | All | `tax_settings_json` placeholder on Location | P3 |
| 18 | Sort order | None | Cannot pin "main kitchen" above pickup points | Multi-location | `sort_order` int + UI to reorder | P3 |

## Priority legend

- **P0** — Foundation / data safety / model gap
- **P1** — High-value functional gap
- **P2** — Polish / scale
- **P3** — Future

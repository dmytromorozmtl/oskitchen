# Routes module audit (KitchenOS)

**Date:** 2026-05-11
**Scope:** `/dashboard/routes`, `actions/delivery-route.ts`, Prisma `DeliveryRoute` / `DeliveryStop`, `DeliveryDispatch` (Uber Direct rows), nav + module-registry entries for routes, references in calendar/executive/today/reports.

## TL;DR

The Routes page is a single screen that builds a date-grouped route from open DELIVERY orders and writes placeholder address JSON onto each stop. There is no zone model, driver profile model, route mode, embedded map gate, manifest view, stop status flow, or failed-delivery workflow. Order Hub / Packing handoff is implicit (via `packingBatches?.routeId` linkage) but not exposed in UI.

## Findings

| # | Area | Current state | Limitation | Business types affected | Recommended fix | Pri |
|---|------|----------------|-------------|--------------------------|------------------|-----|
| 1 | UI surface | Single page `app/dashboard/routes/page.tsx` with form + flat list | No tabs, no detail page, no planner, no driver view, no manifest, no zones, no drivers | All | Split into Command Center with subroutes (overview/planner/[routeId]/drivers/zones/uber-direct/reports/settings) | P1 |
| 2 | Route builder | `createDeliveryRouteFromOrdersAction` bundles by pickupDate only | No window, brand/location, zone, or mode | Meal prep, catering, multi-brand | Extend planner with filters + persisted mode | P1 |
| 3 | Data model: `DeliveryRoute` | `userId`, `routeDate`, `driverName`, `status`, `totalStops`, `estimatedDistance`, `estimatedDuration` | No brand/location/zone, no mode, no driver ref, no window, no completed/failed counters, no title/notes | All | Additive columns + new enum `DeliveryRouteMode` | P0 |
| 4 | Data model: `DeliveryStop` | `routeId`, `orderId`, `sequence`, `customerName`, `addressJson`, window, status, notes | No phone, customer ref, packing/payment status, coords, maps URL, deliveredAt, failedReason, proof | All | Additive columns + `FailedDeliveryReason` enum | P0 |
| 5 | Statuses | `DeliveryRouteStatus`: PLANNED/IN_PROGRESS/COMPLETED/CANCELLED; `DeliveryStopStatus`: PENDING/DELIVERED/FAILED/SKIPPED | Missing DRAFT/PACKING/READY/OUT_FOR_DELIVERY/PARTIALLY_COMPLETED/FAILED for routes and PACKED/READY/LOADED/OUT_FOR_DELIVERY/RETURNED for stops | All | Extend both enums additively | P1 |
| 6 | Zones | No model | No zone-based fees, geofences, or storefront integration | Meal prep, catering, café, bakery | Add `DeliveryZone` model + zones page | P1 |
| 7 | Drivers | `driverName` free-text only | No driver profile, no route history, no contact, no vehicle | All | Add `DriverProfile` model + drivers page | P1 |
| 8 | Audit / activity | None — no event log for routes/stops | No tracing of who reordered, marked failed, printed manifest | All | Add `DeliveryEvent` model + activity tab | P1 |
| 9 | Maps integration | Free-form Google Maps `search?query=` from `addressJson.notes ?? customerName` | `GOOGLE_MAPS_API_KEY` exists in env but is unused; no embedded fallback | All | Add `maps-links` helper; embed `<iframe src="https://www.google.com/maps/embed/v1/place?…">` only when key present; never crash if missing | P1 |
| 10 | Manifest / print | No manifest screen | Drivers print the whole admin page; no offline-friendly view | All | Add `/dashboard/routes/[id]/manifest` print-friendly layout + CSV export | P1 |
| 11 | Packing handoff | `PackingBatch.routeId` exists | Not surfaced in routes UI; no readiness gate | Meal prep, catering, bakery | Show packing readiness column on stops; gate "READY" status | P1 |
| 12 | Order Hub integration | None on routes side | Order Hub cannot show assigned route/stop status; no reschedule path | All | Read DeliveryStop in Order Hub; failed-delivery action creates KitchenTask follow-up | P1 |
| 13 | Storefront fulfillment | Storefront settings has delivery windows but no zone link | Cannot enforce zones at checkout | Meal prep, bakery, catering | Document integration; zones page provides API for storefront (future) | P2 |
| 14 | Uber Direct | `DeliveryDispatch` model present, no UI | Hidden capability; no honest placeholder | Restaurant, ghost kitchen | Add `/dashboard/routes/uber-direct` with checklist + record placeholder events | P2 |
| 15 | Permissions | `PlanGate(feature='delivery_routes')` only | No role-based driver scoping | All | Driver view restricted to assigned routes; reuse `isSuperAdminEmail` for override | P1 |
| 16 | Empty states | "No routes yet" generic | No guidance for missing addresses / no eligible orders | All | Replace with task-oriented empty states (build / open hub / fix addresses) | P2 |
| 17 | Performance | Hard-limit `take: 30` on routes | No filter UI; can't search drivers/dates; loads all stops eagerly | All | Tabular list with date filter; lazy load stops on detail page | P2 |
| 18 | Business-mode terminology | Single static "Delivery routes" title | Confusing for catering loadouts and café pickup runs | Catering, café, bakery | Dynamic title via business-mode registry | P2 |
| 19 | Driver UX | No mobile-first surface | Drivers see admin layout | Meal prep, catering | Driver route view at `/dashboard/routes/[id]/driver` | P2 |
| 20 | Audit / safety | "Optimized" wording avoided in current copy | OK; preserve honest framing | All | Use "manual stop order" and "optimization placeholder" | P0 |

## Priority legend

- **P0** — Data safety / integrity / honest framing
- **P1** — High-value functional gap
- **P2** — Polish / scale
- **P3** — Future

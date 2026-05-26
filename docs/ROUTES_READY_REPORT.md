# Routes — ready report

**Date:** 2026-05-11
**Scope:** Route Command Center, planner, route detail, manifest, driver view, drivers, zones, Uber Direct placeholder, reports, settings, plus Prisma schema extensions.

## What changed

- **UI:** `/dashboard/routes` rebuilt as a Command Center with KPIs and quick-build form. Subnav routes added: `/planner`, `/drivers`, `/zones`, `/driver`, `/uber-direct`, `/reports`, `/settings`. Route detail at `/dashboard/routes/[routeId]` with reorder arrows, stop status form, driver assignment, map embed (when key present), and activity log. Printable manifest at `/dashboard/routes/[routeId]/manifest`. Mobile driver view at `/dashboard/routes/[routeId]/driver` plus an index at `/dashboard/routes/driver`.
- **Server actions:** `actions/delivery-route.ts` extended with `createManualRoute*`, `reorderStop*`, `updateStopStatus*`, `assignDriver*`, `createDriver*`, `createZone*`, `recordManifestPrintedAction`, `recordUberQuotePlaceholderAction`. Legacy `createDeliveryRouteFromOrdersFormAction` preserved.
- **Services:** `services/routes/route-service.ts` (CRUD, transitions, derivations), `services/routes/route-overview.ts` (KPIs).
- **Domain libs:** `lib/routes/route-types.ts`, `route-status.ts`, `route-stops.ts`, `delivery-windows.ts`, `maps-links.ts`, `route-planning.ts`.
- **Prisma:** extended enums (`DeliveryRouteStatus`, `DeliveryStopStatus`), new enums (`DeliveryRouteMode`, `DeliveryEventType`, `FailedDeliveryReason`), new columns on `delivery_routes` / `delivery_stops`, new tables `delivery_zones`, `driver_profiles`, `delivery_events`.

## Route planner

- Build by pickup date (legacy, preserved).
- Manual route with brand / location / zone / mode / driver / vehicle / notes.
- Defaults to business-type-aware mode via `routeTerminologyForMode`.

## Stop management

- Manual reorder via up/down arrows (`applyReorder`).
- Status transitions validated by `canTransitionStop`.
- Failed delivery reasons recorded with the status change.
- Phone link via `callPhoneHref`; Maps search per stop; combined directions URL on the detail page.

## Driver view

- Mobile-first single-route layout at `/dashboard/routes/[routeId]/driver`.
- General driver index at `/dashboard/routes/driver` returns today’s routes for the current user (`userId` or `driverUserId`).

## Zones

- `DeliveryZone` model + `/dashboard/routes/zones` page.
- Postal codes stored uppercased; radius, fee, minimum order surfaced for storefront/checkout integration.

## Packing handoff

- `packing_status` column on `DeliveryStop` surfaced in admin + manifest.
- Existing `PackingBatch.routeId` / `PackingWave.routeId` relationships retained and untouched.

## Order Hub integration

- Stops still link to `/dashboard/orders` for context; failed reason + stop status are visible from the route detail. Automatic order-status mirroring is intentionally not added to avoid races with POS / storefront flows.

## Storefront integration

- Zones are now a first-class operational object that storefront checkout (future iteration) can use to compute fees, minimums, and postal-code eligibility. No storefront behavior is regressed by this change.

## Manifests / exports

- Printable driver manifest with route header + ordered stop list. "Record & print" records a `MANIFEST_PRINTED` event before invoking `window.print()`.
- CSV-style stop export remains via the Import / Export Center (`packing` and `production` exports already cover packaging-side data); a dedicated stop CSV can be added when a tenant needs it.

## Uber Direct limitations

- `/dashboard/routes/uber-direct` is explicitly a placeholder. Buttons elsewhere recording `UBER_QUOTE_REQUESTED_PLACEHOLDER` make the inevitable "did we try this yet?" audit answerable without ever calling Uber. Historical `DeliveryDispatch` rows from earlier code paths are still visible (read-only).

## Business modes supported

- Meal prep, catering, bakery, café, restaurant, ghost / cloud / multi-brand, bar (event-only). All flow through `routeTerminologyForMode` for title + subtitle + default mode.

## Remaining limitations

- No optimization API.
- No live Uber Direct dispatch (intentional).
- No GPS tracking.
- No automatic Order Hub status sync on stop completion.
- Storefront checkout does not yet read `DeliveryZone` directly.
- Driver permissions still rely on workspace ownership; granular `WorkspaceMember` roles for drivers/packers come with the broader RBAC sweep.

## Next recommendations

1. Storefront checkout uses `DeliveryZone` to enforce postal / radius / fee / minimum.
2. Optional auto-mirror of `Order.status` when all delivery stops are `DELIVERED`.
3. CSV export of route stops for finance / payroll.
4. Live Uber Direct quote/create + webhook handler (real implementation), keeping the placeholder event type intact for legacy audit rows.
5. RBAC: driver-only routes when `driverUserId` matches the current user.

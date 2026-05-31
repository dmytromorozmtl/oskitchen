# Route architecture

## Layers

1. **UI** — `app/dashboard/routes/**` (RSC pages, subnav layout, print manifest).
2. **Actions** — `actions/delivery-route.ts` — Server Actions for build, manual create, reorder, status, assign, manifest, zone/driver creation.
3. **Services** — `services/routes/route-service.ts`, `services/routes/route-overview.ts`.
4. **Domain libs** — `lib/routes/*`:
   - `route-types.ts` — mode union + per-business terminology.
   - `route-status.ts` — status labels, transitions, derivations.
   - `route-stops.ts` — reorder + transition validators.
   - `delivery-windows.ts` — formatting helpers.
   - `maps-links.ts` — search / directions / embed (gated on API key).
   - `route-planning.ts` — date helpers + planner types.
5. **Prisma** — `DeliveryRoute`, `DeliveryStop`, `DeliveryZone`, `DriverProfile`, `DeliveryEvent`, `DeliveryDispatch` (Uber).

## Statuses

- **Route**: `DRAFT` → `PLANNED` → `PACKING` → `READY` → `IN_PROGRESS` / `OUT_FOR_DELIVERY` → `COMPLETED` / `PARTIALLY_COMPLETED` / `FAILED` / `CANCELLED`. Derived automatically from stop statuses except for terminal manual states.
- **Stop**: `PENDING` → `PACKED` / `READY` → `LOADED` → `OUT_FOR_DELIVERY` → `DELIVERED` / `FAILED` / `RETURNED` / `SKIPPED`. Backward transitions blocked (`canTransitionStop`).

## Modes

`DeliveryRouteMode` — meal prep, catering, bakery, café, restaurant, event, ghost kitchen, pickup handoff, Uber Direct placeholder.

## Events

`DeliveryEvent` rows record route created, assigned, stop status changes, manifest printed/exported, and the explicit Uber-quote placeholder.

## Invariants

- Manual stop order only — OS Kitchen does not call optimization APIs.
- Uber Direct UI is a placeholder; no live dispatch from these screens.
- Missing `GOOGLE_MAPS_API_KEY` falls back to external Google Maps links; embed disabled gracefully.
- Existing `createDeliveryRouteFromOrdersAction` preserved for any external callers.

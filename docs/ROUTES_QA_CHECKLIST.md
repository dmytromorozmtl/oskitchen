# Routes QA checklist

Run after changes to Routes, Prisma route models, or `actions/delivery-route.ts`.

## Commands

```bash
npx prisma generate
npm run typecheck
npm run build
```

## Build by pickup date

- [ ] `/dashboard/routes` — "Quick build by pickup date" picks open DELIVERY orders for that date.
- [ ] Empty pickup date returns "No open delivery orders" error message.

## Manual route

- [ ] `/dashboard/routes/planner#manual` — create manual route with default mode pre-selected by business type.
- [ ] Newly created manual route lands on `/dashboard/routes/[routeId]` (redirect).
- [ ] Status starts as `DRAFT`.

## Stops

- [ ] Reorder arrows update sequence (no full re-render flicker).
- [ ] Status form rejects illegal transitions (UI shows error from action).
- [ ] FAILED requires a `failedReason` to be useful — UI keeps "OTHER" as default fallback.
- [ ] DELIVERED stamps `deliveredAt`.

## Driver assignment

- [ ] Picking a driver profile saves; free-text override saves too.
- [ ] Driver view (`/dashboard/routes/[routeId]/driver`) shows the same stops in mobile layout.
- [ ] `/dashboard/routes/driver` lists today’s routes for the current user.

## Manifest

- [ ] `/dashboard/routes/[routeId]/manifest` prints cleanly (subnav + back button hidden).
- [ ] "Record & print" inserts `MANIFEST_PRINTED` event.

## Zones

- [ ] Add zone with postal codes; codes stored uppercased.
- [ ] Zone appears in planner dropdown.
- [ ] Zone row shows route count.

## Drivers

- [ ] Add driver; appears in planner + detail page driver picker.
- [ ] Driver row shows recent routes.

## Maps

- [ ] Detail page embeds map when `GOOGLE_MAPS_API_KEY` is set.
- [ ] Without the key, "Open in Google Maps" external link still works.
- [ ] Missing key never throws.

## Uber Direct

- [ ] `/dashboard/routes/uber-direct` renders without credentials.
- [ ] Checklist shows green only for the present env vars.
- [ ] Historic `DeliveryDispatch` rows render read-only.

## Audit / activity

- [ ] Route detail activity panel shows ROUTE_CREATED for each new route.
- [ ] Stop status updates produce `STOP_DELIVERED` / `STOP_FAILED` / etc. events.
- [ ] Manifest printed produces `MANIFEST_PRINTED`.

## Permissions

- [ ] Logged-out users cannot reach `/dashboard/routes` — redirected to `/login`.
- [ ] PlanGate still wraps the overview page for `delivery_routes`.

## Integrations

- [ ] Order Hub link from each stop still navigates to `/dashboard/orders` (orderId surfaced in copy).
- [ ] Packing handoff column shows `packing_status` if set externally.

## Existing behavior preserved

- [ ] Legacy `createDeliveryRouteFromOrdersAction` still exists and works.
- [ ] `/dashboard/calendar` and `/dashboard/executive` still load (they read `deliveryRoute`).

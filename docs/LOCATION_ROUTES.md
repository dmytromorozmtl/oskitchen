# Location routes

`DeliveryRoute.locationId` already exists. Route Planner has a "location"
filter and can use `Location.addressJson` as the route start.

## Detail tab

`/dashboard/locations/[id]/routes` lists the 30 most recent routes that
start at this location. Each card links to the route detail page.

## Suggested integration points

- **Route Planner start address** — derive from
  `Location.addressJson` when the location is selected. Keep the existing
  per-route `startAddressJson` as an override.
- **Route Planner filter** — when the global switcher is on a single
  location, default the planner's location filter to that id.
- **Failed-delivery follow-up tasks** — the Tasks integration already passes
  `sourceType=ROUTE` + `sourceId=routeId`. Adding `locationId` to the task is
  a one-line change inside `services/routes/route-service.ts → updateStopStatus()`
  when this lands.

## Driver scoping

Drivers can be scoped to one location via `LocationActorScope.allowedLocationIds`.
Helpers in `lib/locations/location-permissions.ts` already accept the list;
once `WorkspaceMember.role` plus a `WorkspaceMemberLocation` join table land,
populate the scope from there.

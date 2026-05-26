# Route planner

## Route

`/dashboard/routes/planner`

## Flows

1. **Build from delivery orders** — pickup date + optional driver name → groups every open DELIVERY order with that pickup date into a route, sequenced by `createdAt`. Re-uses existing `createDeliveryRouteFromOrdersAction`.
2. **Create manual route** — empty route shell with title, mode, brand, location, zone, driver name, vehicle, notes. Default mode is derived from the workspace business type (`routeTerminologyForMode`). Stops can be added later via Order Hub assignment or import.

## Filters / pickers

- Brands (workspace-owned)
- Locations (active only)
- Zones (active only)
- Driver name (free-text override even if no driver profile exists)
- Mode (full `DeliveryRouteMode` union)

## Wording

- "Manual stop order" everywhere.
- "Optimization placeholder" is the only word we use for sequencing — no claims of real optimization.

## Empty state

When no drivers exist yet, a callout points to `/dashboard/routes/drivers`.

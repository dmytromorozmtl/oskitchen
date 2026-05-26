# Location detail page

Route: `/dashboard/locations/[locationId]`

Renders a shared header (name, type badge, status badge, timezone, reports
link) plus a sub-tab navigation. Each tab is a separate page so server
filtering is fast and the URL is shareable.

## Overview

KPI grid scoped to today:

- Orders today
- Production batches
- Packing batches
- Delivery routes
- Open tasks
- Inventory shortages

"Next best action" card surfaces the missing setup steps in order:

1. Address
2. Business hours
3. Fulfillment settings
4. Promote `SETUP → ACTIVE`

## Profile

Single form bound to `updateLocationProfileAction`. Updates name, type,
status, timezone, manager, phone, email, default brand, address (line1/2,
city, region, postal code, country), notes. Includes a Danger Zone with
`archiveLocationAction`.

## Hours

Three independent weekly editors (`business`, `pickup`, `delivery`) — each
bound to `updateLocationHoursAction` with a `scope` discriminator. JSON shape:

```json
{ "mon": { "open": "08:00", "close": "20:00", "closed": false }, ... }
```

`lib/locations/location-hours.ts → parseWeeklyHours()` keeps reads forgiving.

## Fulfillment

Single form bound to `updateLocationFulfillmentAction`. Pickup + delivery
toggles, lead times, cutoff minutes, delivery fee, min order, max orders per
window, free-form instructions. JSON shape lives in
`lib/locations/location-fulfillment.ts → parseFulfillmentSettings()`.

## Brands / Menus / Orders / Production / Routes / Inventory

Light-weight reader tabs scoped by `locationId`. Drill-down links go back to
the canonical module pages, so we never duplicate logic.

## Reports

Detail-scoped 30-day KPI strip:

- Orders + revenue
- Production batches
- Delivery routes
- Tasks created / completed / completion rate
- Inventory shortages

## Settings

Last 30 `LocationAssignmentEvent` rows for this location plus a second danger
zone for archiving.

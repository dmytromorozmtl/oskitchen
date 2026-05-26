# Route detail page

## Route

`/dashboard/routes/[routeId]`

## Layout

Single page rather than tabbed sub-routes (Phase 6 grouping in spec) — sections render simultaneously so dispatch can see stops + status + map + activity at a glance.

Sections:

- **Header** — title, mode, status, totals, window, primary CTAs (Maps directions URL, Manifest, Driver view).
- **Stops** — ordered list with reorder arrows, status form, per-stop Maps + phone link, packing status, failed reason, window.
- **Driver** — assign driver profile or free-text override.
- **Status** — `ROUTE_STATUS_LABEL` badge + delivered/failed counts. Updates automatically as stops change.
- **Map preview** — embedded iframe when `GOOGLE_MAPS_API_KEY` is set; falls back to external Google Maps directions link.
- **Activity** — last 50 `DeliveryEvent` rows for this route.

## Print

The full driver manifest lives at `/dashboard/routes/[routeId]/manifest` — the subnav and back button are hidden on print via `print:hidden`.

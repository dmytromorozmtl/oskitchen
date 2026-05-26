# Storefront analytics dashboard

## Current

- Beacon/API records visits and conversion events (including `order_submitted`, `order_paid` after Stripe).
- Admin analytics page still primarily tabular / counters.

## Next PR

- 7/30/90 day charts, funnel steps (`checkout_start` → `order_submitted` → `order_paid`), UTM table from stored referrer metadata / `kos_ref` cookie if present in events.

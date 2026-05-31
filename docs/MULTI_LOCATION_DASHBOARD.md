# Multi-location dashboard

Aggregate and cross-location analytics for operators running multiple kitchens or storefronts.

## Surfaces

- **Dashboard:** `/dashboard/locations/dashboard`
- **Reports index:** `/dashboard/locations/reports` (30-day operational counts)
- **Service:** `services/analytics/multi-location-analytics.ts`

## Metrics

| Metric | Source |
|--------|--------|
| Orders / revenue | `Order` rows in analytics window |
| AOV | Revenue ÷ orders per location |
| Pickup / delivery mix | `Order.fulfillmentType` |
| Routes / tasks | `DeliveryRoute`, `KitchenTask` groupBy location |
| Unassigned | Orders without `locationId` |

## Filters

Uses the standard analytics filter bar (date range, brand, location).

## Plan gate

Requires `multi_location` entitlement (Team / Enterprise plans).

See `tests/unit/multi-location-analytics.test.ts`.

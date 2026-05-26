# Routes ↔ Storefront integration

## Today

- Storefront settings already carry pickup windows, delivery enabled/notes, delivery radius, delivery fee, and tax rules (`KitchenSettings` + `StorefrontSettings`).
- `DeliveryZone` is the canonical place to express zone-based fees, minimum orders, and postal codes.

## Recommended wiring

1. Storefront checkout reads `DeliveryZone` to:
   - Validate buyer postal code against `postalCodesJson`.
   - Show the right `deliveryFee` and enforce `minimumOrderAmount`.
   - Suggest a delivery window matching the route schedule.
2. After checkout, the order’s zone hint is preserved so the planner can later assign it to the matching route.

## Constraints

- Routes does not own the storefront checkout — that work lives in `/s/[storeSlug]/checkout`. Routes provides the zone API surface only.
- Zones are scoped to `userId` like the rest of the workspace data.

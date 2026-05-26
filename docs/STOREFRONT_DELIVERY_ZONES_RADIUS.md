# Storefront delivery zones and radius

## Implemented

- `lib/storefront/delivery-zones.ts` — parse/normalize postal tokens (US ZIP, CA postal).
- `lib/storefront/delivery-validation.ts` — `validateStorefrontDelivery` used in `submitPublicStorefrontOrder`.
- `services/storefront/storefront-delivery-service.ts` — stable import surface for callers.
- Admin fulfillment copy explains that **radius km is not enforced** without geocoding.

## Rules

- **Pickup** — no zone checks.
- **Delivery** — requires address; if JSON zones exist with `postalCodes` or `regions`, at least one enabled zone must match or checkout fails.
- **Zone `minimumOrder`** compared to **pre-discount subtotal** of line items.
- **`deliveryRadiusKm`** — diagnostic only; never used to reject an address in code (no fake GPS).

## JSON shape (example)

```json
[
  {
    "name": "Downtown",
    "enabled": true,
    "postalCodes": ["941", "94103"],
    "minimumOrder": 35,
    "fee": 5
  }
]
```

## Future

- Geocode + haversine radius when a provider and coordinates exist.
- Polygon windows and per-zone fees overriding global fee (today global fee + promo still apply as before).

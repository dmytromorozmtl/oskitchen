# Delivery zones

## Model

`DeliveryZone`: name, description, `postalCodesJson` (array of uppercased strings), `radiusKm`, `deliveryFee`, `minimumOrderAmount`, `active`.

## Route

`/dashboard/routes/zones`

## Inputs

- **Name** (unique per workspace).
- **Postal codes** — accept comma- or whitespace-separated tokens, stored uppercased.
- **Radius (km)** — optional, helps storefront fulfillment infer eligibility from a center point.
- **Delivery fee / minimum order** — surfaced in storefront checkout and route planning.

## Uses

- `DeliveryRoute.zoneId` — group routes by zone, filter in planner.
- Storefront fulfillment (future) — enforce zone at checkout, show fee.
- Reports — slice route performance by zone.

## Notes

Adding a zone does not auto-update prior orders or routes. Zones are operational policy, not historical truth.

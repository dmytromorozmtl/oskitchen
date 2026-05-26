# Storefront fulfillment — final reference

## Implemented today

- Pickup / delivery toggles on `StorefrontSettings`.
- Delivery fee + free delivery threshold (storefront overrides, else kitchen defaults).
- Closure window + message (`closureEnabled`, dates, `closureMessage`).
- **Blackout dates** model (`StorefrontBlackoutDate`) validated at checkout.
- Text instructions: pickup/delivery instructions fields on settings.

## Schema for the next iteration

- `StorefrontFulfillmentRule` — JSON windows, lead times, per-day caps (not yet interpreted everywhere).
- `StorefrontMenuPublish` — optional snapshots / scheduled unpublish (not wired to cron).

## Gaps (P0/P1)

- Visual schedule editor + customer-facing time-slot picker.
- Delivery zone polygon + distance validation.
- Max orders **per window** (not only per day).

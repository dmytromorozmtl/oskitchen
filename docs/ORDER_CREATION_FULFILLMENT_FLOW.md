# Fulfillment flow

## Fields

- `fulfillmentDetail` — widened key (Pickup, Delivery, Dine-in, Event
  delivery, Catering loadout, Third-party delivery, Custom).
- `pickupDate` — `DATE`.
- `fulfillmentWindowStart` / `fulfillmentWindowEnd` — `TIMESTAMPTZ`.
- `deliveryAddressJson` — JSON with line1, line2, city, region,
  postalCode, country, notes.
- `pickupLocationId` — optional FK to a workspace `Location`.
- `deliveryNotesExt`, `kitchenNotes`, `packingNotes` — free text.

## Business mode defaults

| Mode | Allowed |
|------|---------|
| Restaurant | Pickup, Delivery, Dine-in |
| Café | Pickup, Dine-in |
| Bakery | Pickup, Delivery |
| Bar event | Event delivery, Pickup, Custom |
| Catering | Event delivery, Catering loadout, Pickup |
| Meal plan | Delivery, Pickup |
| Custom request | Custom, Pickup, Delivery, Event delivery |

## Warnings

Selecting any delivery-type fulfillment with no address line populates a
warning in the right-hand Summary. The review step also surfaces missing
prepared dates for bakery / catering.

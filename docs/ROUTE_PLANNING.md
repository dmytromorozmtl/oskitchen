# Delivery route planning

## What it does

Groups delivery orders by **pickup date**, creates `DeliveryRoute` + `DeliveryStop` rows, surfaces driver-oriented lists, and opens **Google Maps search** links (consumer URLs — no API calls required).

## Setup

1. Ensure delivery orders carry meaningful pickup dates.
2. Dashboard → **Routes** → pick the date → **Build route**.
3. Optionally set `GOOGLE_MAPS_API_KEY` for future embedded routing UI (not required today).

## Limitations

- Addresses default to placeholder JSON until order-level address modeling expands.
- No traveling-salesperson optimization yet.

## Future improvements

- Drag reorder persisted per route.
- Printable manifest PDF.
- SMS driver links via Twilio/etc.

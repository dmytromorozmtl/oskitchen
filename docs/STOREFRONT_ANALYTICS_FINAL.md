# Storefront analytics — final reference

## Collection

- API: `POST /api/storefront/analytics` accepts `eventName`, optional metadata (no raw customer notes).
- Tables: `StorefrontVisit` (hashed IP/UA), `StorefrontConversionEvent` (funnel steps).

## Events in use / planned

| Event | Status |
| --- | --- |
| `page_view` | Via beacon component |
| `product_view` | Product detail client |
| `add_to_cart` | Menu/cart interactions |
| `checkout_start` | Checkout page |
| `order_submitted` | Server on successful order |
| `contact_submitted` / `catering_submit` | Contact action |
| `order_tracking_view` | **TODO** on public order page |

## Admin

- `/dashboard/storefront/analytics` surfaces aggregates.

Privacy: never store plaintext IP or full user-agent strings in analytics tables (hashing preferred).

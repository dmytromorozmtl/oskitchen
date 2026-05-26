# Storefront analytics

Events POST to `/api/storefront/analytics` with JSON body:

`page_view` → inserts `StorefrontVisit` (hashed IP + UA).

Other events (`product_view`, `add_to_cart`, `checkout_start`, `order_submitted`, `contact_submitted`) → `StorefrontConversionEvent`.

**No** raw customer notes or PII beyond slug + optional metadata keys you pass from the client.

Admin **Analytics** tab shows counts grouped by `eventName` and total visits.

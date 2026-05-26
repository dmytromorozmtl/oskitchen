# Storefront discounts admin

- Route: `/dashboard/storefront/discounts` (linked from subnav).
- Actions: `actions/storefront-discounts.ts` — create, toggle active, delete.
- Checkout: validation unchanged in `actions/storefront-order.ts`; promo usage for **online** orders increments only after Stripe webhook success when a pending promo id was stored on the internal order.

## Not in UI yet

- Per-customer limits, category/product scoping, fulfillment-type scoping, audit timeline UI.

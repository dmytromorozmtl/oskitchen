# Storefront setup

## What it does

Publishes a **mobile-first guest experience** at `/s/[storeSlug]` with menu browsing, cart, checkout (pickup/delivery toggles), preorder request flow (pay-later friendly), and confirmation links keyed by `publicToken`. Checkout creates an internal `Order` when configured.

## Setup

1. Dashboard → **Storefront**: choose slug, branding fields, fulfillment toggles, optional active menu.
2. Toggle **Enable storefront**; copy the public URL from the publishing card.
3. Ensure products on the active menu have realistic prepared/pickup dates for badges.

## Limitations

- No hosted payment collection unless your separate Stripe checkout flows are invoked elsewhere.
- Custom domains are stored as metadata only until DNS automation ships.

## Future improvements

- Stripe Checkout line-items from cart.
- Structured delivery zones and fees.
- Theme previews and storefront analytics.

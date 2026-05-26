# Storefront checkout flow

1. Customer builds cart (`localStorage`, key `kitchenos-store-cart-v2-{slug}`; migrates legacy session key once).
2. `/s/{slug}/checkout` loads active menu prices server-side.
3. Client posts `submitPublicStorefrontOrder` with lines + customer + fulfillment + optional `termsAccepted`.
4. Server enforces: storefront published, not in closure window, preorder enabled, menu ownership, min order, optional terms, optional daily cap, delivery rules.
5. Creates `Order` (internal hub) + `StorefrontOrder` + `StorefrontOrderItem` rows + conversion `order_submitted`.
6. Redirects to `/s/{slug}/order/{publicToken}`.

Emails: unchanged Resend path via existing kitchen notification settings.

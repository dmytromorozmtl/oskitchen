# Storefront & Customer Portal Clarity

## Positioning

OS Kitchen storefront is a **first-party commerce surface** for operators who want branded pickup/delivery without standing up a separate Shopify theme — **not** a generic website builder.

## Routes

- Operator: `/dashboard/storefront`  
- Public: `/s/[storeSlug]/*` (menu, checkout, policies)

## Honesty rules

- If Stripe is not configured, **checkout must degrade** with clear copy (no fake charge success).  
- Subscriptions / loyalty / gift cards: **only** when implemented end-to-end — otherwise roadmap language only.

## Customer post-purchase

Order status / lookup tokens should remain **minimal PII** surfaces (no raw payment pan, no secrets).

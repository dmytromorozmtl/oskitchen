# Storefront commerce evolution

## Current

- Admin pillar: `/dashboard/storefront/*` (theme, pages/sections, SEO, domains, ordering, fulfillment…).
- Public: `/s/[storeSlug]`, custom pages `/s/[storeSlug]/p/[pageSlug]`, checkout when configured.

## Rules

- **Stripe checkout only if configured** — do not simulate payments.
- Gift cards / subscriptions / loyalty remain **explicit placeholders** until backend contracts exist.

## Priority

**P1** for D2C meal prep & preorder brands.

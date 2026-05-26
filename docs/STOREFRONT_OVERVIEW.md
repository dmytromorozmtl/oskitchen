# Storefront overview

Public storefronts live at **`/s/[storeSlug]`** (permanent). Optional vanity hosts rewrite to that path via middleware.

## Capabilities

- Weekly menu, product detail, cart (`localStorage`), checkout (pay-later).
- Static marketing pages: about, FAQ, contact, catering inquiry.
- Custom pages: `/s/[slug]/p/[pageSlug]` backed by `StorefrontPage`.
- Order confirmation & tracking: `/s/[slug]/order/[token]` (legacy `/order-confirmation/...` redirects).

## Environment

- `NEXT_PUBLIC_APP_URL` — canonical app URL.
- `NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN` — apex used for `slug.<domain>` rewrites.
- `STOREFRONT_MIDDLEWARE_SECRET` — secures `/api/storefront/resolve-host` for custom domains.

## Database

See Prisma models: `StorefrontSettings`, `StorefrontPage`, `StorefrontSection`, `StorefrontTheme`, `StorefrontOrder`, `StorefrontOrderItem`, `StorefrontDomain`, `StorefrontVisit`, `StorefrontConversionEvent`, `StorefrontContactSubmission`.

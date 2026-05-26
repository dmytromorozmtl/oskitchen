# Storefront final architecture

## High-level

- **Admin** (`/dashboard/storefront/*`): merchant configuration, content, and operations. Server Actions under `actions/storefront-*.ts` persist to Postgres via Prisma.
- **Public** (`/s/[storeSlug]/*`): server-rendered Next.js App Router pages. Guests only see `enabled && published` rows unless the owner is previewing (session match).
- **Vanity hosts**: `middleware.ts` rewrites external host paths to internal `/s/{slug}/…` using subdomain extraction or `GET /api/storefront/resolve-host` (protected by `STOREFRONT_MIDDLEWARE_SECRET`).

## Data flow (preorder)

1. Menu products loaded through `getStorefrontForPublic` → `StorefrontSettings.activeMenu` with `storefrontVisible` filter.
2. Cart: client `localStorage` keyed by slug; checkout posts UUID lines to `submitPublicStorefrontOrder`.
3. Server validates storefront state, menu membership, max qty, cutoff, closure, **blackout dates**, minimum, promo, fulfillment toggles.
4. Transaction: `Order` + `StorefrontOrder` + optional `StorefrontDiscount.usesCount` increment.
5. Conversion event `order_submitted`; optional Resend email.

## Extension points

- **CMS:** `StorefrontPage` / `StorefrontSection` + `lib/storefront/sections.ts`.
- **Merch rules:** `StorefrontFulfillmentRule.rulesJson` (interpreter not yet centralised).
- **Domains:** `StorefrontDomain` + settings `primaryDomainMode`; SSL/DNS remain hosting-provider steps.

## Non-goals (by design)

- Not a full visual Webflow-style builder in v1.
- No automatic DNS provisioning from KitchenOS.

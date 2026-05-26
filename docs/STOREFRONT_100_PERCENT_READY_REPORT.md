# Storefront 100% ready report

**Date:** 2026-02-07  
**Audience:** Engineering + product + implementation partners.

## Fully implemented (production-usable)

- Path-based storefront `/s/[storeSlug]/*` including **policies** routes, **product slug or UUID** URLs, cart, checkout, order token page.
- Pay-later checkout with **server validation** (closure, cutoff, menu membership, min order, blackout dates, per-item max qty, promo codes).
- **Transactional promo** application + discount use counter.
- **Honeypot** on contact/catering submissions.
- **Admin console** tabs: Launch, Website, Pages, Theme, Menu, Products, Overview, Ordering, Fulfillment, Forms, Domains, SEO, Analytics, Notifications, Settings, Advanced, Preview.
- **Products** admin: slug, visibility, featured flag, max quantity.
- **SEO:** metadata helper, conservative product JSON-LD, sitemap route including products + policies.
- **Middleware** vanity routing including `/policies/*` and `/sitemap.xml`.
- **Database:** migration `20260207140000_storefront_production_layer` adds storefront commerce extension tables + product storefront columns + `StorefrontOrder.isTestOrder` + indexes.
- **Tests:** unit coverage for product ref resolver, blackout helper, middleware path map.

## Production-ready with external setup

- **Custom domains / subdomains** — requires DNS + hosting (e.g. Vercel) configuration; KitchenOS stores intent and verification metadata only.
- **Email** — optional Resend + verified sender domain.

## Placeholder / partial

- `StorefrontForm` builder UI; runtime rendering from `fieldsJson`.
- `StorefrontRedirect` execution at the edge.
- `StorefrontFulfillmentRule` visual editor + strict slot picker for guests.
- `StorefrontMenuPublish` scheduler.
- `order_tracking_view` analytics event.
- Rate limits / CAPTCHA on public POST endpoints.

## Payment limitations

- Stripe **not** required for storefront preorder requests.
- Online card collection remains a future integration; toggles may exist but must not block pay-later.

## Launch checklist

Use `/dashboard/storefront/launch` + `docs/STOREFRONT_LAUNCH_GUIDE.md`.

## QA checklist

Use `docs/STOREFRONT_QA_CHECKLIST.md`.

## Next improvements (ordered)

1. Sold-out / availability unified with `ProductAvailability` on storefront menu + cart.
2. Rate limiting + optional Turnstile on contact + checkout.
3. Admin CRUD for blackouts, discounts, redirects.
4. Order tracking analytics beacon.
5. E2E smoke in CI.

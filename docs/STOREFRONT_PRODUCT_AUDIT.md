# Storefront product audit

## Summary

OS Kitchen evolved the public storefront from a single preorder surface into a **commerce-oriented public site** with routing, SEO hooks, domain mapping, analytics events, and expanded persistence—while **keeping `/s/[storeSlug]`** as the canonical path.

| Area | Current state | Business impact | Priority |
|------|----------------|-------------------|----------|
| Data model | `StorefrontSettings` extended; pages/sections/themes/domains/visits/events/orders modeled | Enables builder + ops | P0 |
| Admin | Tabbed `/dashboard/storefront/*`; overview form saves core + SEO + domains mode | Faster go-live | P1 |
| Public routes | Home, menu, cart, checkout, product, about/contact/faq/catering, custom `/p/[slug]`, order tracking | Full funnel | P0 |
| Checkout | Server validation: published, closure, min order, terms, menu integrity, line items persisted | Trust + fewer disputes | P0 |
| Domains | Middleware rewrite + `resolve-host` API (secret); env-driven subdomain | White-label | P1 |
| SEO | Metadata + JSON-LD scaffold; per-page overrides planned via `StorefrontPage` | Discoverability | P1 |
| Cart | `localStorage` + legacy session migration | Fewer abandoned carts | P1 |
| Payments | Pay-later default; `onlinePaymentEnabled` flag only (no forced Stripe) | Compliance with scope | P0 |
| Analytics | Visit + conversion tables; `/api/storefront/analytics` | Growth insight | P2 |
| Builder UI | DB ready; admin drag-drop not shipped | Limits marketing agility | P2 |
| Rate limiting | Not implemented | Abuse risk | P3 |
| Impersonation / tenant | Storefront is per-user today | Multi-workspace later | P3 |

## Security

- Unpublished storefronts: **404 for guests**; **owner preview** when logged in.
- Checkout requires **`enabled && published`**.
- Custom domain resolution: **internal API + shared secret** (not for browsers).

## Privilege / consistency

- Domain mode enum vs actual DNS: **documented**—operators must configure Vercel/DNS manually.

## Recommended next steps

1. Rich page builder UI on `StorefrontPage` / `StorefrontSection`.
2. Rate limit `analytics` + `submitPublicStorefrontOrder`.
3. Workspace-scoped storefront when multi-tenant UX is ready.

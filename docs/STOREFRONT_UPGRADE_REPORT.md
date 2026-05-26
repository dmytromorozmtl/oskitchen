# Storefront upgrade report

## What shipped

- **Prisma** migration `20260207140000_storefront_production_layer`: storefront blackouts, discounts, redirects, forms, menu publish audit table, nav/footer JSON, fulfillment rules JSON, assets; product `publicSlug` / visibility / featured / max qty; `StorefrontOrder.isTestOrder`; indexes.
- **Prisma** migration `20260507140000_storefront_commerce_v2`: expanded `StorefrontSettings`, `StorefrontOrder`, new tables for pages, sections, themes, order line items, domains, visits, conversion events, contact submissions; enum extensions for order status + payment modes.
- **Public routes:** `/s/[slug]/cart`, `/products/[productId]`, `/about`, `/contact`, `/faq`, `/catering`, `/p/[pageSlug]`, `/order/[token]`, `/s/[slug]/sitemap.xml` (placeholder URL list); legacy confirmation URL **redirects**.
- **Access control:** `published` flag; guests require `enabled && published`; owners see drafts when authenticated.
- **Checkout:** closure window, minimum order, optional legal checkbox, delivery fee + free threshold, line-item persistence, conversion logging, optional **customer notes**, daily cutoff + duplicate-submit guard (`lib/storefront/checkout.ts`).
- **Middleware:** subdomain + custom-domain slug resolution with cookie-preserving rewrite; vanity hosts map `/sitemap.xml` → per-store sitemap.
- **APIs:** `/api/storefront/resolve-host`, `/api/storefront/analytics`.
- **Admin:** `/dashboard/storefront` layout tabs (including **Menu & products**, **Settings**, preview) + analytics + preview iframe + domain guidance; overview shows **orders today** and last updated; Settings tab lists recent **contact/catering** submissions and edits contact email/phone/privacy.
- **SEO:** per-product JSON-LD (`Product` + `Offer`, preorder availability) via `buildMenuProductJsonLd`.
- **Public UX:** homepage featured menu strip, testimonials placeholder, public footer with privacy/contact.
- **Libraries:** `lib/storefront/*`, `lib/storefront-queries` re-exports.

## Payment stance

Pay-later remains default; online payment toggle is architectural only until Stripe is wired per merchant.

## Next steps

1. Builder UI for `StorefrontSection` JSON with Zod validation per type.
2. Richer submission inbox (filters, export, mark done) beyond the Settings tab list.
3. Rate limits + bot protection on public POST endpoints.
4. Expand sitemap to include custom pages and product URLs when stable.

`npm run typecheck` and `npm run build` should be run after storefront changes; fix any regressions before release.

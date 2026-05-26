# Storefront SEO

- Global defaults: `seoTitle`, `seoDescription`, `seoImageUrl`, `robotsPolicy`, `canonicalBaseUrl` on `StorefrontSettings`.
- Layout merges **Open Graph** metadata and **FoodEstablishment** JSON-LD (conservative fields only).
- Product routes set title/description from menu item + storefront.
- Future: hydrate from `StorefrontPage` / `StorefrontSection` for landing pages.

Sitemap generation is a **placeholder** (not yet routed)—add `/s/[slug]/sitemap.xml` when indexable pages are enumerated from the DB.

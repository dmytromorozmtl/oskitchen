# Storefront SEO — final reference

## Implemented

- `buildStorefrontMetadata` — title/description/canonical using `storefrontCanonicalBase` (path / subdomain / custom domain aware).
- **Product JSON-LD** — `buildMenuProductJsonLd` emits `Product` + `Offer` with `PreOrder` availability; URLs respect public slug when set.
- **Sitemap** — `/s/[storeSlug]/sitemap.xml` lists core routes + product URLs + policies.

## Planned / partial

- BreadcrumbList JSON-LD.
- Robots policy per store (`robotsPolicy` field exists; enforcement TBD).
- CMS pages in sitemap.

## Guidelines

- Do not emit schema fields without backing data (address/geo when absent, etc.).

See: `docs/STOREFRONT_SEO.md`.

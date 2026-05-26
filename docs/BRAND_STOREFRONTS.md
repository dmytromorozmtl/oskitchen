# Brand-scoped storefronts

## Target patterns

1. One storefront row per brand (needs schema relaxation of per-user uniqueness).  
2. Multi-brand storefront with brand picker / landing routes.  
3. Brand landing path under shared apex domain.  
4. Custom domain per brand (`Brand.brandCustomDomain` + `StorefrontSettings.customDomain`).  
5. Subdomain per brand (`StorefrontSettings.subdomain`).

## Current state

- `StorefrontSettings` includes optional `brandId` but remains **one row per `userId`** today.  
- Brand detail links to `/dashboard/storefront` for manual coordination.

## Implementation notes

- Apply `brand-theme` tokens when rendering preview (`lib/brands/brand-theme.ts`).  
- SEO fields live on `Brand` (`seoTitle`, `seoDescription`, `seoImageUrl`) for future head injection on brand routes under `/s/[storeSlug]`.

Non-destructive path: add additional storefront entities in a later migration without dropping existing rows.

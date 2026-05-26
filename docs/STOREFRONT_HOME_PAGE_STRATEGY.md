# HOME page strategy

## Choice

Use existing `StorefrontPageType.HOME` with slug **`home`**.

## Rules

- At most one HOME page per storefront (`actions/storefront-pages.ts` create guard).
- HOME slug forced to `home`; URL for builder remains `/dashboard/storefront/pages/{id}` — public home is `/s/[storeSlug]` (not `/p/home`).
- HOME cannot be deleted (`deleteStorefrontPage` redirects without delete).

## Public rendering

- `app/s/[storeSlug]/page.tsx` loads HOME with sections (respects `published` unless owner preview).
- If no visible sections: legacy hero + CTA block remains (backward compatible).

## Seeding

- `services/storefront/storefront-home-service.ts` — `ensureDefaultHomeStorefrontPage`.
- Invoked after `upsertStorefrontSettings` creates/updates a storefront row.

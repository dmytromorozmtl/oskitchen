# Navigation & footer — public integration

## Components

- `components/storefront/StorefrontNavigation.tsx` — validated links, logo, tagline.
- `components/storefront/StorefrontFooter.tsx` — validated blocks + policies column + contact + sanitized privacy HTML.

## Validation modules

- `lib/storefront/link-normalization.ts` — unsafe protocols.
- `lib/storefront/navigation-validation.ts` — Zod parse of `itemsJson` / array; HTTPS external URLs; hidden/draft filtering.
- `lib/storefront/footer-validation.ts` — link blocks + text blocks; disabled/hidden handling.

## Published vs draft audience

- `lib/storefront/theme-snapshot.ts` — `selectNavigationJsonForAudience` / `selectFooterJsonForAudience`.
- **Public published storefront:** if `themePublishedAt` is set, nav/footer JSON is read from `themePublishedJson` snapshot.
- **Draft storefront (owner or signed preview):** live DB rows (`navigation`, `footer`) for builder parity.

## Fallbacks

- Nav: Home / Menu / Contact when parse yields zero links.
- Footer: default explore + policies + contact placeholder + optional privacy HTML.

## Internal targets

Extended `NavItemTarget` kinds: `about`, `policies_privacy`, `policies_terms` (see `lib/storefront-builder/navigation-types.ts`).

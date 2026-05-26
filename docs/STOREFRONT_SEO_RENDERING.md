# Storefront SEO rendering

## Metadata

- `lib/storefront/seo.ts` remains canonical implementation.
- `lib/storefront/storefront-seo.ts` re-exports helpers for storefront-focused imports.

## Analytics scripts

- `components/storefront/storefront-analytics-scripts.tsx`
  - If **GTM** is configured, **GA4 gtag is not injected** (avoids double counting).
  - Meta Pixel loads only when ID matches a strict numeric pattern.

## Public layout

- `app/s/[storeSlug]/layout.tsx` wires GTM bootstrap (unchanged) plus the analytics component.

## Consent

- No cookie-consent gate existed in storefront layout; scripts run when IDs are configured. If a consent layer is added later, gate both GTM bootstrap and `StorefrontAnalyticsScripts` behind it.

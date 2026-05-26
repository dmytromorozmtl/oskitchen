# Design tokens → CSS variables (feature flag)

## Flag

- `NEXT_PUBLIC_STOREFRONT_DESIGN_TOKENS_CSS_VARS=true` enables scoped variables on `.kos-storefront-root`.

## Modules

- `lib/storefront/theme-flags.ts`
- `lib/storefront/design-tokens.ts` — wraps `mergeDesignTokensFromSettings`.
- `lib/storefront/design-token-css-vars.ts` — maps to `--sb-*` vars via existing `designTokensToCssVars`.

## Checkout safety

- `app/s/[storeSlug]/layout.tsx` skips scoped token style when pathname matches checkout (`lib/storefront/store-path.ts` + `x-kos-pathname` middleware header).
- Legacy `--store-accent` remains on outer wrapper for backward compatibility.

## Token source

- Draft unpublished storefront: `mergeDraftThemeTokensIntoSettings`.
- Otherwise: `mergePublishedThemeTokensIntoSettings` (no-op until first publish).

## Contrast

- Existing `ThemeContrastCheck` dashboard component unchanged; no automatic checkout recoloring.

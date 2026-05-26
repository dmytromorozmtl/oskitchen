# Storefront performance policy

## Constants

See `lib/storefront/performance-limits.ts` for caps: sections/page, nav links, footer blocks, FAQ items, rich text length, slider slides, default image bytes.

## Image policy

`lib/storefront/image-policy.ts` — env override `STOREFRONT_MAX_IMAGE_BYTES` (capped at 20MB).

## Builder warnings

`sectionCountWarning` available for UI (wire in dashboard list — follow-up).

## Rendering

Slider images use `loading="lazy"`; hero-level eager loading can be expanded when image sections gain dedicated URLs.

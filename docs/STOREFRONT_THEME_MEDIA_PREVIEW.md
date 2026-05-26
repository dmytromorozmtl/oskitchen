# Storefront theme, media, preview

## Current

- Theme settings remain URL-based in admin.
- No storage-backed upload path added (would require explicit object storage configuration).

## Next PR

- `lib/storefront/theme-validation.ts` — HTTPS-only URLs, block `javascript:`/`data:`.
- `components/storefront/theme-preview.tsx` — logo/favicon/hero previews + contrast warnings.

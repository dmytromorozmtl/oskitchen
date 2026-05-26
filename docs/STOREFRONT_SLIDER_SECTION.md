# Slider section

## Prisma

- `StorefrontSectionType.SLIDER` added (migration `20260614120000_storefront_next_pass_theme_slider_assets`).

## Schema

- `lib/storefront/section-schemas/slider.ts` — slides 1–8, HTTPS image URLs, alt required when image present, CTA href validation, autoplay interval 3000–12000ms, dots/arrows/pause-on-hover.

## Rendering

- `components/storefront/sections/SliderSection.tsx` (client) — keyboard arrows, pause control, respects `prefers-reduced-motion` (disables autoplay), lazy image loading.

## Builder

- Section type available in Prisma-backed dropdown; content still edited via JSON until full form renderer ships.

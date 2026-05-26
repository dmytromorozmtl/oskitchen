# Public Storefront Redesign — Audit & Fix (21 May 2026)

**Production:** https://os-kitchen.com  
**Scope:** `app/s/[storeSlug]/*`, `components/storefront/*` (public)

## Problems found

| Issue | Root cause | Fix |
|-------|------------|-----|
| Dark theme unreadable | Inline `backgroundColor` / `color` from admin on layout root overrode `dark:` Tailwind | Removed inline bg/text; added `storefront.css` dark overrides for `--sb-color-*` |
| Static / cheap look | Narrow `max-w-4xl`, minimal hero, placeholder testimonials block | Wider `sf-container` (72rem), premium hero gradient, `ProductCard`, section renderer |
| Builder sections incomplete | `FEATURED_MENU`, `TESTIMONIALS`, `GALLERY`, etc. fell through to JSON dump | Full renderer in `public-storefront-sections.tsx` + async `FeaturedMenuSection`, `ReviewsSection`, `ContactFormSection` |
| No cart in header | Cart only on menu page | `StorefrontNavCart` in layout navigation |
| No public gift cards | Page missing | `/s/[storeSlug]/gift-cards` + balance lookup action |

## Files changed

- `app/s/[storeSlug]/layout.tsx` — theme-safe brand vars, CSS import, nav cart, wider shell
- `app/s/[storeSlug]/storefront.css` — premium tokens + dark mode
- `app/s/[storeSlug]/page.tsx` — dynamic builder sections, premium fallback
- `app/s/[storeSlug]/gift-cards/page.tsx` — new
- `components/storefront/public-storefront-sections.tsx` — all section types
- `components/storefront/product-card.tsx`, `storefront-nav-cart.tsx`, section partials
- Navigation, footer, menu cards, order tracking — `dark:` classes

## Verification

After deploy: probe `/s/{slug}`, `/menu`, `/checkout`, `/account`, `/gift-cards`, `/orders/.../track`.

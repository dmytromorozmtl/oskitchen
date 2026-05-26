# Menu item ↔ storefront integration

Existing reference: `docs/MENU_STOREFRONT_PUBLISHING.md`.

## Rules

- Checkout and public menu routes resolve products through `StorefrontSettings.activeMenu`.
- **Catalog menus must never be active:** enforced in `actions/storefront-settings.ts`, admin dropdowns filter `catalogOnly`, `getStorefrontForPublic` nullifies a mistaken active catalog menu, migration clears bad FKs, `submitPublicStorefrontOrder` rejects catalog.

## Item fields that matter today

- `storefrontVisible`, `storefrontFeatured`, `maxStorefrontQuantity`, `publicSlug`, price, allergens, images.

## Next

- Per-item SEO tab, structured data, quote-only catering flow on storefront.

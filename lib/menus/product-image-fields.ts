/**
 * Menu item / product image fields (audit reference).
 *
 * | Surface | Field | Storage |
 * |---------|-------|---------|
 * | Menu item (Product) | `image` | `products.image` — storefront menu, product detail, POS |
 * | Menu item SEO | `storefrontOgImageUrl` | `products.storefront_og_image_url` — OG tags (dashboard: storefront products) |
 * | Collection hero | `heroImageUrl` | `menus.storefront_settings_json` — collection page only |
 * | Production SKU | — | `ProductionTask` has no image; uses linked `Product.image` |
 *
 * Storefront resolves `Product.image` on `/s/{slug}/products/{ref}` and menu cards.
 */

import type { MediaPickerAsset } from "@/components/storefront/media/media-picker-dialog";

export type ProductMediaAsset = MediaPickerAsset;

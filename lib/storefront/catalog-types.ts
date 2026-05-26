/** Public menu product — server-built catalog row (single source of truth for cart/checkout). */
export type StorefrontCatalogVariant = {
  id: string;
  title: string;
  sku: string | null;
  price: number;
  soldOut: boolean;
  canAddToCart: boolean;
};

export type StorefrontCatalogModifierOption = {
  id: string;
  name: string;
  priceAdjustment: number;
};

export type StorefrontCatalogModifierGroup = {
  id: string;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  options: StorefrontCatalogModifierOption[];
};

export type StorefrontCatalogProduct = {
  id: string;
  publicSlug: string | null;
  title: string;
  description: string | null;
  price: number;
  preparedDate: string;
  image: string | null;
  maxStorefrontQuantity: number | null;
  soldOut: boolean;
  availableQty: number | null;
  canAddToCart: boolean;
  variants: StorefrontCatalogVariant[];
  modifierGroups: StorefrontCatalogModifierGroup[];
  /** Free-text or comma-separated allergen declaration for checkout warnings. */
  allergens?: string | null;
};

export type StorefrontMenuCatalog = {
  storefrontId: string;
  storeSlug: string;
  menuId: string;
  currency: string;
  /** Active market id when ?market= routing is used */
  marketId?: string | null;
  /** Changes when prices, variants, modifiers, or availability change. */
  priceVersion: string;
  products: StorefrontCatalogProduct[];
};

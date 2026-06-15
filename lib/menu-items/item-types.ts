/**
 * Catalog item classification (application layer).
 * Persist to DB in a follow-up migration when Product gains an `itemType` column.
 */
export const MENU_ITEM_TYPES = [
  "FOOD",
  "BEVERAGE",
  "ALCOHOLIC_BEVERAGE",
  "BAKERY",
  "CATERING_PACKAGE",
  "MEAL_PREP_MEAL",
  "ADD_ON",
  "MODIFIER",
  "SERVICE",
  "EVENT_PACKAGE",
  "RETAIL_ITEM",
] as const;

export type MenuItemType = (typeof MENU_ITEM_TYPES)[number];

export const MENU_ITEM_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "INACTIVE",
  "SOLD_OUT",
  "ARCHIVED",
] as const;

export type MenuItemStatus = (typeof MENU_ITEM_STATUSES)[number];

export const MENU_ITEM_VISIBILITY = [
  "INTERNAL_ONLY",
  "STOREFRONT_VISIBLE",
  "SALES_CHANNELS_VISIBLE",
  "PRODUCTION_ONLY",
  "QUOTE_ONLY",
] as const;

export type MenuItemVisibility = (typeof MENU_ITEM_VISIBILITY)[number];

export const CATERING_PRICE_MODES = ["FIXED", "PER_PERSON", "CUSTOM_QUOTE"] as const;

export type CateringPriceMode = (typeof CATERING_PRICE_MODES)[number];

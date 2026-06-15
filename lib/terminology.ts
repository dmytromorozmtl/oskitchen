import type { BusinessType } from "@prisma/client";

import type { Locale, MessageKey } from "@/lib/i18n";
import { t } from "@/lib/i18n";

import { resolveBusinessType } from "@/lib/business-modes";

/** Nav / UI copy overrides per operating mode (English only for now). */
const NAV_EN_OVERRIDES: Partial<Record<BusinessType, Partial<Record<MessageKey, string>>>> = {
  MEAL_PREP: {
    "nav.menus": "Weekly menus",
    "nav.products": "Meals & items",
    "nav.production": "Prep day production",
    "nav.orders": "Preorders",
  },
  CATERING: {
    "nav.menus": "Catering menus",
    "nav.products": "Packages & items",
    "nav.production": "Event production",
    "nav.orders": "Events & orders",
  },
  RESTAURANT: {
    "nav.menus": "Menus",
    "nav.products": "Menu items",
    "nav.production": "Prep list & production",
  },
  CAFE: {
    "nav.menus": "Daily menus & specials",
    "nav.products": "Menu items & specials",
    "nav.production": "Prep & baking",
    "nav.orders": "Orders",
  },
  BAR: {
    "nav.menus": "Drinks & events menu",
    "nav.products": "Drinks & items",
    "nav.production": "Bar prep",
    "nav.orders": "Orders & requests",
    "nav.catering": "Event requests",
  },
  BAKERY: {
    "nav.menus": "Preorder menus",
    "nav.products": "Bakery items",
    "nav.production": "Batch production",
    "nav.orders": "Preorders & pickup",
  },
  GHOST_KITCHEN: {
    "nav.brands": "Brands (ghost)",
    "nav.orderHub": "Order hub (all brands)",
    "nav.orders": "Channel orders",
  },
  CLOUD_KITCHEN: {
    "nav.locations": "Locations & kitchens",
    "nav.orderHub": "Order hub",
    "nav.orders": "Orders",
  },
  MULTI_BRAND: {
    "nav.brands": "Brands",
    "nav.executive": "Portfolio executive",
  },
  OTHER: {},
};

export function navLabelForBusinessType(
  locale: Locale,
  businessType: BusinessType | null | undefined,
  key: MessageKey,
): string {
  const mode = resolveBusinessType(businessType);
  if (locale === "en") {
    const o = NAV_EN_OVERRIDES[mode]?.[key];
    if (o) return o;
  }
  return t(locale, key);
}

export function checklistMenuLabel(businessType: BusinessType | null | undefined): string {
  const mode = resolveBusinessType(businessType);
  const map: Record<BusinessType, string> = {
    MEAL_PREP: "At least one weekly menu",
    CATERING: "At least one catering menu window",
    GHOST_KITCHEN: "Menus published for each brand",
    CLOUD_KITCHEN: "Menus aligned to locations",
    MULTI_BRAND: "Menus per brand",
    RESTAURANT: "At least one active menu",
    CAFE: "Daily menu or specials board live",
    BAR: "Drinks or events menu live",
    BAKERY: "Preorder menu window live",
    OTHER: "At least one menu",
  };
  return map[mode] ?? map.OTHER;
}

export function checklistProductsLabel(businessType: BusinessType | null | undefined): string {
  const mode = resolveBusinessType(businessType);
  const map: Record<BusinessType, string> = {
    MEAL_PREP: "Meals & SKUs live",
    CATERING: "Packages & line items live",
    GHOST_KITCHEN: "Sellable items per brand",
    CLOUD_KITCHEN: "Sellable items per location/brand",
    MULTI_BRAND: "Sellable catalog per brand",
    RESTAURANT: "Menu items live",
    CAFE: "Menu items & specials live",
    BAR: "Drinks & food items live",
    BAKERY: "Bakery SKUs & custom order templates live",
    OTHER: "Menu items live",
  };
  return map[mode] ?? map.OTHER;
}

import type { BrandConceptKind, BusinessType, MenuStrategy } from "@prisma/client";

export type BrandTemplateKey =
  | "restaurant"
  | "cafe"
  | "bar_events"
  | "bakery_preorder"
  | "catering"
  | "meal_prep"
  | "ghost_kitchen"
  | "cloud_kitchen";

export type BrandTemplateDefaults = {
  conceptKind: BrandConceptKind;
  defaultBusinessMode: BusinessType | null;
  descriptionHint: string;
  storefrontTemplate: string;
  menuStrategy: MenuStrategy;
};

const DEFAULTS: Record<BrandTemplateKey, BrandTemplateDefaults> = {
  restaurant: {
    conceptKind: "RESTAURANT_CONCEPT",
    defaultBusinessMode: "RESTAURANT",
    descriptionHint: "Full-service or fast-casual concept with dine-in and takeout.",
    storefrontTemplate: "restaurant-classic",
    menuStrategy: "RESTAURANT_MENU",
  },
  cafe: {
    conceptKind: "CAFE_CONCEPT",
    defaultBusinessMode: "CAFE",
    descriptionHint: "Daypart café with retail and beverage focus.",
    storefrontTemplate: "cafe-warm",
    menuStrategy: "CAFE_SPECIALS",
  },
  bar_events: {
    conceptKind: "BAR_CONCEPT",
    defaultBusinessMode: "BAR",
    descriptionHint: "Drinks-led concept with events and private booking surfaces.",
    storefrontTemplate: "bar-events",
    menuStrategy: "DRINKS_MENU",
  },
  bakery_preorder: {
    conceptKind: "BAKERY_CONCEPT",
    defaultBusinessMode: "BAKERY",
    descriptionHint: "Preorder pickup slots and allergen-forward merchandising.",
    storefrontTemplate: "bakery-preorder",
    menuStrategy: "BAKERY_PREORDER",
  },
  catering: {
    conceptKind: "CATERING_BRAND",
    defaultBusinessMode: "CATERING",
    descriptionHint: "Packages, quotes, and event workflows.",
    storefrontTemplate: "catering-quote",
    menuStrategy: "CATERING_PACKAGES",
  },
  meal_prep: {
    conceptKind: "MEAL_PREP_BRAND",
    defaultBusinessMode: "MEAL_PREP",
    descriptionHint: "Weekly menus, cutoff times, and batch production.",
    storefrontTemplate: "meal-prep-weekly",
    menuStrategy: "WEEKLY_PREORDER",
  },
  ghost_kitchen: {
    conceptKind: "GHOST_KITCHEN_BRAND",
    defaultBusinessMode: "GHOST_KITCHEN",
    descriptionHint: "Virtual brand sharing kitchen capacity with distinct guest promise.",
    storefrontTemplate: "ghost-minimal",
    menuStrategy: "MULTI_BRAND_MENU",
  },
  cloud_kitchen: {
    conceptKind: "CLOUD_KITCHEN_BRAND",
    defaultBusinessMode: "CLOUD_KITCHEN",
    descriptionHint: "Delivery-first brand tuned for marketplace velocity.",
    storefrontTemplate: "delivery-first",
    menuStrategy: "DAILY_MENU",
  },
};

export function parseBrandTemplateKey(raw: string | undefined): BrandTemplateKey | null {
  if (!raw) return null;
  const k = raw.trim().toLowerCase().replace(/-/g, "_") as BrandTemplateKey;
  return k in DEFAULTS ? k : null;
}

export function getBrandTemplateDefaults(key: BrandTemplateKey): BrandTemplateDefaults {
  return DEFAULTS[key];
}

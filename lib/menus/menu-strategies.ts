import type { BusinessType, MenuStrategy } from "@prisma/client";

/** All supported strategies (mirrors Prisma `MenuStrategy`). */
export const MENU_STRATEGY_ORDER: readonly MenuStrategy[] = [
  "WEEKLY_PREORDER",
  "DAILY_MENU",
  "RESTAURANT_MENU",
  "CAFE_SPECIALS",
  "DRINKS_MENU",
  "BAKERY_PREORDER",
  "CATERING_PACKAGES",
  "EVENT_MENU",
  "SEASONAL_MENU",
  "MULTI_BRAND_MENU",
];

export type MenuStrategyDefinition = {
  key: MenuStrategy;
  label: string;
  description: string;
  /** Business types where this strategy is first-class (others may still use it manually). */
  supportedBusinessModes: readonly BusinessType[];
  /** Suggested default when creating from wizard without a pick. */
  recommendedFor: readonly BusinessType[];
  defaultTitle: string;
  defaultCategories: readonly string[];
  requiredFields: readonly string[];
  optionalFields: readonly string[];
  availabilityRules: string;
  storefrontBehavior: string;
  productionBehavior: string;
  fulfillmentBehavior: string;
  reportingBehavior: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
  primaryCta: string;
  secondaryCta: string;
  defaultSections: readonly string[];
  warnings: readonly string[];
};

const ALL: readonly BusinessType[] = [
  "MEAL_PREP",
  "CATERING",
  "GHOST_KITCHEN",
  "CLOUD_KITCHEN",
  "MULTI_BRAND",
  "BAKERY",
  "RESTAURANT",
  "CAFE",
  "BAR",
  "OTHER",
];

const DEFS: Record<MenuStrategy, MenuStrategyDefinition> = {
  WEEKLY_PREORDER: {
    key: "WEEKLY_PREORDER",
    label: "Weekly preorder",
    description: "Time-boxed menu with preorder deadline and prepared dates — ideal for meal prep.",
    supportedBusinessModes: ["MEAL_PREP", "BAKERY", "CATERING", "GHOST_KITCHEN", "OTHER"],
    recommendedFor: ["MEAL_PREP"],
    defaultTitle: "Week of …",
    defaultCategories: ["Mains", "Sides", "Breakfast", "Add-ons"],
    requiredFields: ["startDate", "endDate", "preorderDeadline"],
    optionalFields: ["preparedDatesJson", "pickupWindows", "deliveryWindows"],
    availabilityRules: "Menu visible between start and end; preorder closes at deadline.",
    storefrontBehavior: "Shows weekly range and preorder deadline; prepared dates drive pickup copy.",
    productionBehavior: "Groups work by prepared date and packing waves.",
    fulfillmentBehavior: "Supports pickup, delivery, and route batches.",
    reportingBehavior: "Cutoff adherence, SKU mix, route readiness.",
    emptyStateTitle: "No weekly menus yet",
    emptyStateDescription:
      "Create your first weekly preorder menu with deadlines, prepared dates, and pickup or delivery windows.",
    primaryCta: "Create weekly menu",
    secondaryCta: "Browse templates",
    defaultSections: ["This week", "Add-ons", "Beverages"],
    warnings: [],
  },
  DAILY_MENU: {
    key: "DAILY_MENU",
    label: "Daily menu",
    description: "Single-day or rolling-day menu for dine-in, takeout, or same-day prep.",
    supportedBusinessModes: ALL,
    recommendedFor: ["RESTAURANT", "CAFE", "BAR"],
    defaultTitle: "Today’s menu",
    defaultCategories: ["Lunch", "Dinner", "Sides", "Beverages"],
    requiredFields: ["startDate", "endDate"],
    optionalFields: ["availabilityJson", "preorderDeadline"],
    availabilityRules: "Typically start = end = service day; optional daypart windows in JSON.",
    storefrontBehavior: "Emphasizes today / tomorrow availability.",
    productionBehavior: "Prep list by day and station.",
    fulfillmentBehavior: "Pickup, delivery, or dine-in placeholders — configure in fulfillment JSON.",
    reportingBehavior: "Day-over-day attach rate and sell-outs.",
    emptyStateTitle: "No daily menus yet",
    emptyStateDescription: "Publish what you are serving today with categories and availability windows.",
    primaryCta: "Create daily menu",
    secondaryCta: "Open planner",
    defaultSections: ["Lunch", "Dinner"],
    warnings: [],
  },
  RESTAURANT_MENU: {
    key: "RESTAURANT_MENU",
    label: "Restaurant menu",
    description: "Stable à la carte structure with categories and channel availability.",
    supportedBusinessModes: ["RESTAURANT", "GHOST_KITCHEN", "CLOUD_KITCHEN", "MULTI_BRAND", "OTHER"],
    recommendedFor: ["RESTAURANT", "GHOST_KITCHEN"],
    defaultTitle: "Main menu",
    defaultCategories: ["Starters", "Mains", "Sides", "Desserts", "Beverages"],
    requiredFields: ["startDate", "endDate"],
    optionalFields: ["availabilityJson", "preorderDeadline", "channelAvailability"],
    availabilityRules: "Optional date range for seasonal rotations; default open-ended window.",
    storefrontBehavior: "Online menu / takeout request — wording depends on fulfillment toggles.",
    productionBehavior: "Station-based prep lists.",
    fulfillmentBehavior: "Pickup and takeout friendly; delivery only when explicitly enabled.",
    reportingBehavior: "Item mix, attach, margin when costing exists.",
    emptyStateTitle: "No menus yet",
    emptyStateDescription:
      "Build your restaurant menu, organize items by category, and publish to your storefront or channels.",
    primaryCta: "Create restaurant menu",
    secondaryCta: "Browse templates",
    defaultSections: ["Starters", "Mains", "Desserts"],
    warnings: [],
  },
  CAFE_SPECIALS: {
    key: "CAFE_SPECIALS",
    label: "Café specials",
    description: "Dayparts, baked goods, drinks, and rotating specials.",
    supportedBusinessModes: ["CAFE", "BAKERY", "RESTAURANT", "OTHER"],
    recommendedFor: ["CAFE"],
    defaultTitle: "Daily specials",
    defaultCategories: ["Morning", "Lunch", "Pastries", "Coffee & drinks"],
    requiredFields: ["startDate", "endDate"],
    optionalFields: ["availabilityJson", "preorderDeadline"],
    availabilityRules: "Supports daypart blocks and same-day pickup windows.",
    storefrontBehavior: "Highlights today’s pastries and drinks.",
    productionBehavior: "Morning bake + line service prep.",
    fulfillmentBehavior: "Counter pickup default.",
    reportingBehavior: "Sell-through by daypart.",
    emptyStateTitle: "No daily specials yet",
    emptyStateDescription: "Plan today’s specials, drinks, baked goods, and pickup availability.",
    primaryCta: "Create daily specials menu",
    secondaryCta: "Open planner",
    defaultSections: ["Pastries", "Sandwiches", "Drinks"],
    warnings: [],
  },
  DRINKS_MENU: {
    key: "DRINKS_MENU",
    label: "Drinks menu",
    description: "Cocktails, beer, wine, NA, and happy hour — no alcohol delivery claims by default.",
    supportedBusinessModes: ["BAR", "RESTAURANT", "CAFE", "CATERING", "OTHER"],
    recommendedFor: ["BAR"],
    defaultTitle: "Drinks & events",
    defaultCategories: ["Cocktails", "Beer", "Wine", "Non-alcoholic", "Happy hour"],
    requiredFields: ["startDate", "endDate"],
    optionalFields: ["availabilityJson", "happyHour", "eventVisibility"],
    availabilityRules: "Optional happy-hour windows in availability JSON.",
    storefrontBehavior: "Category-led menu; pair with inquiry / booking CTA — comply with local alcohol rules.",
    productionBehavior: "Bar prep and event batches.",
    fulfillmentBehavior: "On-premise service default; never imply unsupported alcohol delivery.",
    reportingBehavior: "Category mix and event inquiries.",
    emptyStateTitle: "No drinks or event menu yet",
    emptyStateDescription:
      "Create a drinks menu, happy hour list, or private event menu for guests and staff.",
    primaryCta: "Create drinks menu",
    secondaryCta: "Browse templates",
    defaultSections: ["Cocktails", "Wine", "Beer"],
    warnings: [
      "Alcohol service and delivery are jurisdiction-specific — configure fulfillment honestly; OS Kitchen does not provide legal compliance.",
    ],
  },
  BAKERY_PREORDER: {
    key: "BAKERY_PREORDER",
    label: "Bakery preorder",
    description: "Lead times, pickup slots, allergens, and batch-friendly SKUs.",
    supportedBusinessModes: ["BAKERY", "CAFE", "MEAL_PREP", "OTHER"],
    recommendedFor: ["BAKERY"],
    defaultTitle: "Weekend preorder",
    defaultCategories: ["Breads", "Pastries", "Cakes", "Seasonal"],
    requiredFields: ["startDate", "endDate", "preorderDeadline"],
    optionalFields: ["fulfillmentRulesJson", "allergenPolicy", "pickupSlots"],
    availabilityRules: "Preorder deadline before first pickup; slotting rules in fulfillment JSON.",
    storefrontBehavior: "Shows preorder window and pickup slots.",
    productionBehavior: "Batch planning by bake list.",
    fulfillmentBehavior: "Pickup slots and lead times.",
    reportingBehavior: "Slot fill rate and waste signals.",
    emptyStateTitle: "No preorder menu yet",
    emptyStateDescription: "Set up pickup slots, lead times, and batch-friendly baked goods.",
    primaryCta: "Create bakery preorder menu",
    secondaryCta: "Browse templates",
    defaultSections: ["Pastries", "Breads"],
    warnings: [],
  },
  CATERING_PACKAGES: {
    key: "CATERING_PACKAGES",
    label: "Catering packages",
    description: "Package menus for quotes, events, and production timelines.",
    supportedBusinessModes: ["CATERING", "RESTAURANT", "BAR", "MULTI_BRAND", "OTHER"],
    recommendedFor: ["CATERING"],
    defaultTitle: "Catering packages",
    defaultCategories: ["Corporate lunch", "Buffet", "Beverage service", "Add-ons"],
    requiredFields: ["startDate", "endDate"],
    optionalFields: ["guestCountPricing", "quoteRequestDefault", "eventDate"],
    availabilityRules: "Optional event date inside availability JSON.",
    storefrontBehavior: "Quote request default — avoid instant checkout unless explicitly enabled.",
    productionBehavior: "Event timeline and batch scaling.",
    fulfillmentBehavior: "On-site service, drop-off, or pickup — configure per package.",
    reportingBehavior: "Quote conversion and package mix.",
    emptyStateTitle: "No catering packages yet",
    emptyStateDescription: "Build package menus for quotes, events, and production planning.",
    primaryCta: "Create catering menu",
    secondaryCta: "Open quotes",
    defaultSections: ["Packages", "Beverages"],
    warnings: [],
  },
  EVENT_MENU: {
    key: "EVENT_MENU",
    label: "Event menu",
    description: "One-off menus tied to events, weddings, or pop-ups.",
    supportedBusinessModes: ALL,
    recommendedFor: ["CATERING", "BAR", "RESTAURANT"],
    defaultTitle: "Event menu",
    defaultCategories: ["Reception", "Dinner", "Bar", "Late night"],
    requiredFields: ["startDate", "endDate"],
    optionalFields: ["eventDate", "guestCounts", "availabilityJson"],
    availabilityRules: "Tight window around event date.",
    storefrontBehavior: "Often private or invite-only — pair with manual inquiry.",
    productionBehavior: "Event timeline and mise en place batches.",
    fulfillmentBehavior: "On-site execution default.",
    reportingBehavior: "Actual vs planned covers.",
    emptyStateTitle: "No event menus yet",
    emptyStateDescription: "Plan menus for specific events with timelines and package tiers.",
    primaryCta: "Create event menu",
    secondaryCta: "Browse templates",
    defaultSections: ["Reception", "Dinner"],
    warnings: [],
  },
  SEASONAL_MENU: {
    key: "SEASONAL_MENU",
    label: "Seasonal menu",
    description: "Longer arcs (seasons, holidays) with merchandising blocks.",
    supportedBusinessModes: ALL,
    recommendedFor: ["RESTAURANT", "BAR", "BAKERY"],
    defaultTitle: "Seasonal feature",
    defaultCategories: ["Seasonal mains", "Pairings", "Retail"],
    requiredFields: ["startDate", "endDate"],
    optionalFields: ["merchandisingBlocks", "availabilityJson"],
    availabilityRules: "Broad window with optional weekly sub-rotations in JSON.",
    storefrontBehavior: "Highlights seasonal story and limited-time SKUs.",
    productionBehavior: "Batch + line mix.",
    fulfillmentBehavior: "Follows workspace fulfillment defaults.",
    reportingBehavior: "Seasonal lift vs baseline.",
    emptyStateTitle: "No seasonal menus yet",
    emptyStateDescription: "Launch limited-time menus with clear start and end dates.",
    primaryCta: "Create seasonal menu",
    secondaryCta: "Browse templates",
    defaultSections: ["Featured", "Pairings"],
    warnings: [],
  },
  MULTI_BRAND_MENU: {
    key: "MULTI_BRAND_MENU",
    label: "Multi-brand menu",
    description: "Lanes for virtual brands sharing production — pair with brand selector.",
    supportedBusinessModes: ["GHOST_KITCHEN", "CLOUD_KITCHEN", "MULTI_BRAND"],
    recommendedFor: ["GHOST_KITCHEN", "CLOUD_KITCHEN", "MULTI_BRAND"],
    defaultTitle: "Brand lane menu",
    defaultCategories: ["Brand A", "Brand B", "Shared sides"],
    requiredFields: ["startDate", "endDate"],
    optionalFields: ["brandId", "locationId", "channelAvailability"],
    availabilityRules: "Per-brand visibility in display JSON.",
    storefrontBehavior: "Slug or brand-specific landing experiences.",
    productionBehavior: "Brand-colored tickets and separate bagging rules.",
    fulfillmentBehavior: "Aggregator-friendly packaging notes.",
    reportingBehavior: "Per-brand contribution.",
    emptyStateTitle: "No brand menus yet",
    emptyStateDescription: "Create menus per virtual brand while sharing the same kitchen.",
    primaryCta: "Create brand menu",
    secondaryCta: "Manage brands",
    defaultSections: ["Brand A", "Brand B"],
    warnings: ["Attach a brand record so reporting and storefront routing stay clean."],
  },
};

export function menuStrategyDefinition(strategy: MenuStrategy): MenuStrategyDefinition {
  return DEFS[strategy];
}

export function defaultMenuStrategyForBusinessType(
  businessType: BusinessType | null | undefined,
): MenuStrategy {
  const mode = businessType ?? "MEAL_PREP";
  switch (mode) {
    case "MEAL_PREP":
      return "WEEKLY_PREORDER";
    case "BAKERY":
      return "BAKERY_PREORDER";
    case "CAFE":
      return "CAFE_SPECIALS";
    case "BAR":
      return "DRINKS_MENU";
    case "CATERING":
      return "CATERING_PACKAGES";
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return "MULTI_BRAND_MENU";
    case "RESTAURANT":
      return "RESTAURANT_MENU";
    default:
      return "WEEKLY_PREORDER";
  }
}

export function isStrategyRecommendedForMode(
  strategy: MenuStrategy,
  businessType: BusinessType | null | undefined,
): boolean {
  const mode = businessType ?? "MEAL_PREP";
  return DEFS[strategy].recommendedFor.includes(mode);
}

import type { BusinessType, FulfillmentType } from "@prisma/client";

import type { DemoVerticalSlug } from "@/lib/demo-verticals";
import type { ModuleKey } from "@/lib/modules/module-registry";
import { MODULE_REGISTRY_ENTRIES } from "@/lib/modules/module-registry";

function resolveMode(value: BusinessType | null | undefined): BusinessType {
  return value ?? "MEAL_PREP";
}

export type MenuStrategyId =
  | "WEEKLY_PREORDER"
  | "DAILY_MENU"
  | "SEASONAL_MENU"
  | "EVENT_MENU"
  | "CATERING_MENU"
  | "DRINKS_MENU"
  | "BAKERY_PREORDER"
  | "SPECIALS_MENU"
  | "MULTI_BRAND_MENU";

export type StorefrontTemplateId =
  | "RESTAURANT_ONLINE_MENU"
  | "CAFE_DAILY_SPECIALS"
  | "BAR_EVENTS_DRINKS"
  | "BAKERY_PREORDER"
  | "CATERING_INQUIRY"
  | "MEAL_PREP_WEEKLY"
  | "GHOST_MULTI_BRAND";

export type ProductionModeId =
  | "LINE_SERVICE"
  | "BATCH_BAKERY"
  | "EVENT_CATERING"
  | "WEEKLY_BATCH_KITCHEN"
  | "MULTI_BRAND_LINE";

export type BusinessModeExperience = {
  businessModeKey: BusinessType;
  label: string;
  shortDescription: string;
  idealFor: string;
  /** Shown first in focused nav — ordered by daily value. */
  defaultModuleKeys: readonly ModuleKey[];
  recommendedModuleKeys: readonly ModuleKey[];
  advancedModuleKeys: readonly ModuleKey[];
  /** Disabled in “recommended” module reset until user enables. */
  hiddenByDefaultModuleKeys: readonly ModuleKey[];
  defaultDashboardWidgets: readonly string[];
  defaultTodayWidgets: readonly string[];
  defaultPlaybookSlugs: readonly string[];
  defaultMenuStrategy: MenuStrategyId;
  defaultStorefrontTemplate: StorefrontTemplateId;
  defaultFulfillmentTypes: readonly FulfillmentType[];
  defaultProductionMode: ProductionModeId;
  defaultDemoVertical: DemoVerticalSlug;
  /** 0–100 product maturity for this operating mode (honest self-score). */
  maturityScore: number;
};

function hrefForModule(key: ModuleKey): string {
  const e = MODULE_REGISTRY_ENTRIES.find((x) => x.key === key);
  return e?.pathPrefixes[0] ?? "/dashboard";
}

export function recommendedHrefsForBusinessType(
  businessType: BusinessType | null | undefined,
): readonly string[] {
  const exp = getBusinessModeExperience(businessType);
  return exp.defaultModuleKeys.map(hrefForModule);
}

function exp(partial: Omit<BusinessModeExperience, "businessModeKey"> & { businessModeKey: BusinessType }): BusinessModeExperience {
  return partial;
}

const MEAL_PREP = exp({
  businessModeKey: "MEAL_PREP",
  label: "Meal prep",
  shortDescription: "Weekly preorder windows with commissary-style production and routes.",
  idealFor: "Commissaries, subscription meal companies, macro kitchens.",
  defaultModuleKeys: [
    "today",
    "orders",
    "order_hub",
    "menus",
    "products",
    "production",
    "packing",
    "nutrition_labels",
    "routes",
    "meal_subscriptions",
    "forecast",
    "ingredient_demand",
    "storefront",
  ],
  recommendedModuleKeys: ["tasks", "purchasing", "costing", "integrations", "calendar", "playbooks", "pos_terminal"],
  advancedModuleKeys: ["executive", "implementation", "import_center", "copilot"],
  hiddenByDefaultModuleKeys: ["implementation", "import_center", "executive", "beta_applications"],
  defaultDashboardWidgets: ["orders_today", "preorder_cutoff", "pack_progress", "route_readiness", "forecast_hint"],
  defaultTodayWidgets: ["priority_actions", "orders_attention", "prep_status", "packing", "routes", "nutrition_tasks"],
  defaultPlaybookSlugs: ["meal-prep-weekly"],
  defaultMenuStrategy: "WEEKLY_PREORDER",
  defaultStorefrontTemplate: "MEAL_PREP_WEEKLY",
  defaultFulfillmentTypes: ["PICKUP", "DELIVERY"],
  defaultProductionMode: "WEEKLY_BATCH_KITCHEN",
  defaultDemoVertical: "meal-prep",
  maturityScore: 72,
});

const CATERING = exp({
  businessModeKey: "CATERING",
  label: "Catering",
  shortDescription: "Quotes → calendar events → production → logistics.",
  idealFor: "Corporate caterers, wedding & event food, drop-off programs.",
  defaultModuleKeys: [
    "today",
    "catering",
    "calendar",
    "orders",
    "production",
    "routes",
    "tasks",
    "customers",
    "menus",
    "products",
    "reports",
  ],
  recommendedModuleKeys: ["order_hub", "costing", "integrations", "locations", "playbooks", "templates", "pos_terminal"],
  advancedModuleKeys: ["executive", "forecast", "implementation", "copilot"],
  hiddenByDefaultModuleKeys: ["meal_subscriptions", "nutrition_labels", "implementation", "executive"],
  defaultDashboardWidgets: ["quote_pipeline", "events_week", "guest_counts", "production_load"],
  defaultTodayWidgets: ["events_today", "quotes_followup", "production_timeline", "delivery_setup", "staff_tasks"],
  defaultPlaybookSlugs: ["catering-event"],
  defaultMenuStrategy: "CATERING_MENU",
  defaultStorefrontTemplate: "CATERING_INQUIRY",
  defaultFulfillmentTypes: ["PICKUP", "DELIVERY"],
  defaultProductionMode: "EVENT_CATERING",
  defaultDemoVertical: "catering",
  maturityScore: 68,
});

const GHOST = exp({
  businessModeKey: "GHOST_KITCHEN",
  label: "Ghost kitchen",
  shortDescription: "Multiple delivery brands sharing one production line.",
  idealFor: "Virtual brands, delivery-only kitchens, aggregator-heavy ops.",
  defaultModuleKeys: [
    "today",
    "order_hub",
    "brands",
    "production",
    "integrations",
    "menus",
    "products",
    "packing",
    "routes",
    "analytics",
  ],
  recommendedModuleKeys: ["orders", "tasks", "locations", "costing", "forecast", "playbooks", "pos_terminal"],
  advancedModuleKeys: ["executive", "implementation", "copilot"],
  hiddenByDefaultModuleKeys: ["meal_subscriptions", "nutrition_labels", "implementation"],
  defaultDashboardWidgets: ["brand_mix", "channel_orders", "integration_health", "prep_backlog"],
  defaultTodayWidgets: ["channel_rush", "brand_load", "failed_syncs", "packing", "routes"],
  defaultPlaybookSlugs: ["ghost-kitchen-rush"],
  defaultMenuStrategy: "MULTI_BRAND_MENU",
  defaultStorefrontTemplate: "GHOST_MULTI_BRAND",
  defaultFulfillmentTypes: ["DELIVERY", "PICKUP"],
  defaultProductionMode: "MULTI_BRAND_LINE",
  defaultDemoVertical: "ghost-kitchen",
  maturityScore: 66,
});

const CLOUD = exp({
  businessModeKey: "CLOUD_KITCHEN",
  label: "Cloud kitchen",
  shortDescription: "Multi-site or multi-lane production with centralized visibility.",
  idealFor: "Regional cloud operators, REEF-style hubs, scaled delivery kitchens.",
  defaultModuleKeys: [
    "today",
    "locations",
    "order_hub",
    "brands",
    "production",
    "integrations",
    "menus",
    "analytics",
    "executive",
  ],
  recommendedModuleKeys: ["orders", "routes", "tasks", "costing", "forecast", "playbooks", "pos_terminal"],
  advancedModuleKeys: ["implementation", "copilot"],
  hiddenByDefaultModuleKeys: ["meal_subscriptions", "nutrition_labels", "implementation"],
  defaultDashboardWidgets: ["location_throughput", "brand_mix", "sla_risk", "labor_tasks"],
  defaultTodayWidgets: ["multi_site_alerts", "channel_orders", "prep_status", "routes"],
  defaultPlaybookSlugs: ["ghost-kitchen-rush"],
  defaultMenuStrategy: "MULTI_BRAND_MENU",
  defaultStorefrontTemplate: "GHOST_MULTI_BRAND",
  defaultFulfillmentTypes: ["DELIVERY", "PICKUP"],
  defaultProductionMode: "MULTI_BRAND_LINE",
  defaultDemoVertical: "ghost-kitchen",
  maturityScore: 64,
});

const MULTI = exp({
  businessModeKey: "MULTI_BRAND",
  label: "Multi-brand",
  shortDescription: "Portfolio view across concepts with shared back office.",
  idealFor: "Restaurant groups testing virtual brands, holding companies.",
  defaultModuleKeys: [
    "today",
    "executive",
    "brands",
    "analytics",
    "order_hub",
    "locations",
    "orders",
    "production",
  ],
  recommendedModuleKeys: ["menus", "products", "costing", "integrations", "reports", "forecast", "pos_terminal"],
  advancedModuleKeys: ["implementation", "copilot"],
  hiddenByDefaultModuleKeys: ["meal_subscriptions", "nutrition_labels", "implementation"],
  defaultDashboardWidgets: ["portfolio_revenue", "brand_compare", "shared_inventory_risk"],
  defaultTodayWidgets: ["brand_alerts", "executive_summary", "integration_health"],
  defaultPlaybookSlugs: ["ghost-kitchen-rush", "restaurant-daily"],
  defaultMenuStrategy: "MULTI_BRAND_MENU",
  defaultStorefrontTemplate: "GHOST_MULTI_BRAND",
  defaultFulfillmentTypes: ["PICKUP", "DELIVERY"],
  defaultProductionMode: "MULTI_BRAND_LINE",
  defaultDemoVertical: "ghost-kitchen",
  maturityScore: 58,
});

const RESTAURANT = exp({
  businessModeKey: "RESTAURANT",
  label: "Restaurant",
  shortDescription: "Service-led prep, takeout/delivery, and margin discipline.",
  idealFor: "Full-service, QSR, and hybrid dine-in / delivery restaurants.",
  defaultModuleKeys: [
    "today",
    "orders",
    "products",
    "production",
    "staff",
    "purchasing",
    "costing",
    "integrations",
    "calendar",
  ],
  recommendedModuleKeys: ["order_hub", "menus", "tasks", "kitchen_screen", "analytics", "playbooks", "pos_terminal"],
  advancedModuleKeys: ["forecast", "implementation", "executive", "copilot"],
  hiddenByDefaultModuleKeys: ["meal_subscriptions", "nutrition_labels", "implementation", "executive"],
  defaultDashboardWidgets: ["covers_or_orders", "prep_completion", "top_items", "shortages"],
  defaultTodayWidgets: ["service_readiness", "takeout_delivery", "prep_list", "staff_tasks", "shortages"],
  defaultPlaybookSlugs: ["restaurant-daily"],
  defaultMenuStrategy: "DAILY_MENU",
  defaultStorefrontTemplate: "RESTAURANT_ONLINE_MENU",
  defaultFulfillmentTypes: ["PICKUP", "DELIVERY"],
  defaultProductionMode: "LINE_SERVICE",
  defaultDemoVertical: "restaurant",
  maturityScore: 70,
});

const CAFE = exp({
  businessModeKey: "CAFE",
  label: "Café",
  shortDescription: "Morning rush, specials, retail SKUs, and light CRM.",
  idealFor: "Coffee shops, daytime cafés, bakery-café hybrids.",
  defaultModuleKeys: [
    "today",
    "orders",
    "menus",
    "products",
    "storefront",
    "purchasing",
    "tasks",
    "customers",
    "calendar",
  ],
  recommendedModuleKeys: ["production", "kitchen_screen", "integrations", "analytics", "playbooks", "pos_terminal"],
  advancedModuleKeys: ["forecast", "implementation", "copilot"],
  hiddenByDefaultModuleKeys: ["meal_subscriptions", "nutrition_labels", "implementation", "executive"],
  defaultDashboardWidgets: ["morning_prep", "pickup_orders", "specials_performance", "repeat_guests"],
  defaultTodayWidgets: ["morning_prep", "specials", "pickup_orders", "supplier_reminders", "low_stock"],
  defaultPlaybookSlugs: ["cafe-morning"],
  defaultMenuStrategy: "SPECIALS_MENU",
  defaultStorefrontTemplate: "CAFE_DAILY_SPECIALS",
  defaultFulfillmentTypes: ["PICKUP", "DELIVERY"],
  defaultProductionMode: "LINE_SERVICE",
  defaultDemoVertical: "cafe",
  maturityScore: 64,
});

const BAR = exp({
  businessModeKey: "BAR",
  label: "Bar / lounge",
  shortDescription: "Drinks-led menu, events, pour cost, and responsible service copy you control.",
  idealFor: "Cocktail bars, wine bars, hotel lounges, music venues.",
  defaultModuleKeys: [
    "today",
    "menus",
    "products",
    "costing",
    "tasks",
    "orders",
    "calendar",
    "catering",
    "integrations",
  ],
  recommendedModuleKeys: ["production", "ingredient_demand", "purchasing", "analytics", "reports", "playbooks", "pos_terminal"],
  advancedModuleKeys: ["forecast", "implementation", "copilot"],
  hiddenByDefaultModuleKeys: ["meal_subscriptions", "nutrition_labels", "implementation"],
  defaultDashboardWidgets: ["pour_margin", "event_pipeline", "top_drinks", "stock_alerts"],
  defaultTodayWidgets: ["bar_prep", "beverage_stock", "event_reminders", "staff_tasks", "margin_alerts"],
  defaultPlaybookSlugs: ["bar-event-night"],
  defaultMenuStrategy: "DRINKS_MENU",
  defaultStorefrontTemplate: "BAR_EVENTS_DRINKS",
  defaultFulfillmentTypes: ["PICKUP", "DELIVERY"],
  defaultProductionMode: "LINE_SERVICE",
  defaultDemoVertical: "bar",
  maturityScore: 60,
});

const BAKERY = exp({
  businessModeKey: "BAKERY",
  label: "Bakery",
  shortDescription: "Preorder windows, batch production, labels, and pickup waves.",
  idealFor: "Artisan bakeries, pastry shops, preorder-only counters.",
  defaultModuleKeys: [
    "today",
    "menus",
    "storefront",
    "production",
    "packing",
    "nutrition_labels",
    "routes",
    "orders",
    "ingredient_demand",
  ],
  recommendedModuleKeys: ["tasks", "purchasing", "customers", "calendar", "playbooks", "templates", "pos_terminal"],
  advancedModuleKeys: ["forecast", "implementation", "copilot"],
  hiddenByDefaultModuleKeys: ["meal_subscriptions", "implementation", "executive"],
  defaultDashboardWidgets: ["preorder_volume", "batch_completion", "pickup_slots", "custom_orders"],
  defaultTodayWidgets: ["batch_plan", "pickup_slots", "label_tasks", "allergen_notes", "custom_orders"],
  defaultPlaybookSlugs: ["bakery-preorder-day"],
  defaultMenuStrategy: "BAKERY_PREORDER",
  defaultStorefrontTemplate: "BAKERY_PREORDER",
  defaultFulfillmentTypes: ["PICKUP", "DELIVERY"],
  defaultProductionMode: "BATCH_BAKERY",
  defaultDemoVertical: "bakery",
  maturityScore: 68,
});

const OTHER = exp({
  businessModeKey: "OTHER",
  label: "Other / mixed",
  shortDescription: "Flexible module set until you pick a sharper operating mode.",
  idealFor: "Pilot tenants, mixed concepts, or atypical food businesses.",
  defaultModuleKeys: ["today", "orders", "menus", "products", "production", "settings"],
  recommendedModuleKeys: ["order_hub", "integrations", "tasks", "calendar", "storefront", "pos_terminal"],
  advancedModuleKeys: ["executive", "forecast", "implementation", "copilot"],
  hiddenByDefaultModuleKeys: ["implementation", "executive", "beta_applications"],
  defaultDashboardWidgets: ["orders_today", "open_tasks", "setup_progress"],
  defaultTodayWidgets: ["priority_actions", "orders_attention", "integration_health"],
  defaultPlaybookSlugs: ["restaurant-daily"],
  defaultMenuStrategy: "DAILY_MENU",
  defaultStorefrontTemplate: "RESTAURANT_ONLINE_MENU",
  defaultFulfillmentTypes: ["PICKUP", "DELIVERY"],
  defaultProductionMode: "LINE_SERVICE",
  defaultDemoVertical: "meal-prep",
  maturityScore: 48,
});

const REGISTRY: Record<BusinessType, BusinessModeExperience> = {
  MEAL_PREP,
  CATERING,
  GHOST_KITCHEN: GHOST,
  CLOUD_KITCHEN: CLOUD,
  MULTI_BRAND: MULTI,
  BAKERY,
  RESTAURANT,
  CAFE,
  BAR,
  OTHER,
};

export function getBusinessModeExperience(
  businessType: BusinessType | null | undefined,
): BusinessModeExperience {
  return REGISTRY[resolveMode(businessType)];
}

export function getBusinessModeHiddenModuleKeys(
  businessType: BusinessType | null | undefined,
): Set<ModuleKey> {
  return new Set(getBusinessModeExperience(businessType).hiddenByDefaultModuleKeys);
}

export function getDefaultOnboardingWorkflowId(
  businessType: BusinessType | null | undefined,
): string {
  const mode = resolveMode(businessType);
  const map: Record<BusinessType, string> = {
    MEAL_PREP: "meal-prep-weekly",
    CATERING: "catering-event",
    GHOST_KITCHEN: "ghost-kitchen-rush",
    CLOUD_KITCHEN: "ghost-kitchen-rush",
    MULTI_BRAND: "ghost-kitchen-rush",
    BAKERY: "bakery-preorder-day",
    RESTAURANT: "restaurant-daily",
    CAFE: "cafe-morning",
    BAR: "bar-event-night",
    OTHER: "manual-orders-only",
  };
  return map[mode];
}

/** Short copy for `/dashboard/settings/modules` — why the registry treats a module a certain way for this mode. */
export function moduleRecommendationBlurb(
  businessType: BusinessType | null | undefined,
  moduleKey: ModuleKey,
): string {
  const exp = getBusinessModeExperience(businessType);
  if (exp.defaultModuleKeys.includes(moduleKey)) {
    return "Core for your operating mode — shown in the focused sidebar.";
  }
  if (exp.recommendedModuleKeys.includes(moduleKey)) {
    return "Recommended next — most teams enable this after the basics.";
  }
  if (exp.advancedModuleKeys.includes(moduleKey)) {
    return "Advanced — turn on when you need deeper analytics or rollout tooling.";
  }
  if (exp.hiddenByDefaultModuleKeys.includes(moduleKey)) {
    return "Hidden in focused nav until you choose “Show all modules” or enable it here.";
  }
  return "Optional for this mode — enable when it matches how you run the business.";
}

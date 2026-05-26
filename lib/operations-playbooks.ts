import type { BusinessType } from "@prisma/client";

export type PlaybookDef = {
  slug: string;
  title: string;
  description: string;
  businessType: BusinessType;
  steps: readonly string[];
  modules: string;
};

export const OPERATIONS_PLAYBOOKS: readonly PlaybookDef[] = [
  {
    slug: "meal-prep-weekly",
    title: "Meal prep weekly cycle",
    description: "Preorder window → production day → packing → routes.",
    businessType: "MEAL_PREP",
    steps: [
      "Confirm active weekly menu and cutoff time.",
      "Review Order hub for channel exceptions.",
      "Run production board by prepared date.",
      "Complete packing verify before dispatch.",
      "Load routes and confirm driver handoff.",
    ],
    modules: "Menus, Order hub, Production, Packing verify, Routes, Forecast",
  },
  {
    slug: "restaurant-daily",
    title: "Restaurant daily prep",
    description: "Service-focused prep with purchasing guardrails.",
    businessType: "RESTAURANT",
    steps: [
      "Scan Today for open tickets and shortages.",
      "Refresh prep list in Production.",
      "Check ingredient demand vs purchasing orders.",
      "Brief staff tasks for service.",
    ],
    modules: "Today, Orders, Production, Ingredient demand, Purchasing, Staff",
  },
  {
    slug: "catering-event",
    title: "Catering event workflow",
    description: "Quote to execution with CRM context.",
    businessType: "CATERING",
    steps: [
      "Review catering quotes in pipeline.",
      "Lock guest counts and menu packages on the calendar.",
      "Translate accepted quote into production tasks.",
      "Plan routes / setup tasks for event day.",
    ],
    modules: "Catering quotes, Calendar, Production, Tasks, Routes, CRM",
  },
  {
    slug: "bakery-preorder-day",
    title: "Bakery preorder day",
    description: "Batch production with pickup discipline.",
    businessType: "BAKERY",
    steps: [
      "Close preorder window in menus.",
      "Sequence batches in Production.",
      "Print labels and run packing verify.",
      "Stage pickup slots on routes or counter.",
    ],
    modules: "Menus, Storefront, Production, Packing, Nutrition labels, Routes",
  },
  {
    slug: "cafe-morning",
    title: "Café morning setup",
    description: "Baked goods, coffee line, specials, and preorder pickups.",
    businessType: "CAFE",
    steps: [
      "Warm ovens and par-bake schedule from Production.",
      "Stock milk, syrups, and cups — note shortages in Purchasing.",
      "Publish daily specials to Storefront and menu boards.",
      "Clear preorder pickup shelf and confirm Tasks for rush.",
    ],
    modules: "Today, Production, Storefront, Menus, Purchasing, Tasks",
  },
  {
    slug: "bar-event-night",
    title: "Bar event night",
    description: "Event setup, beverage pars, garnishes, and responsible service.",
    businessType: "BAR",
    steps: [
      "Review private bookings / deposits in Catering quotes.",
      "Par ice, garnishes, and glassware — align with Costing targets.",
      "Assign floor & bar-back tasks for the shift.",
      "Post-close inventory spot-check and lock POS.",
    ],
    modules: "Today, Catering quotes, Costing, Tasks, Orders, Calendar",
  },
  {
    slug: "ghost-kitchen-rush",
    title: "Ghost kitchen rush",
    description: "Channel surge with brand-aware production and sync hygiene.",
    businessType: "GHOST_KITCHEN",
    steps: [
      "Triage Order hub by brand and promised pickup time.",
      "Balance stations in Production — pause low-SLA brands if needed.",
      "Run packing verify for every outbound bag.",
      "Sweep failed sync rows in Product mapping and Integration health.",
    ],
    modules: "Order hub, Brands, Production, Packing verify, Product mapping, Integrations",
  },
] as const;

export function playbooksForBusinessType(
  businessType: BusinessType | null | undefined,
): readonly PlaybookDef[] {
  const mode = businessType ?? "MEAL_PREP";
  const mapMode =
    mode === "CLOUD_KITCHEN" || mode === "MULTI_BRAND" ? "GHOST_KITCHEN" : mode;
  const own = OPERATIONS_PLAYBOOKS.filter((p) => p.businessType === mapMode);
  if (own.length > 0) return own;
  return OPERATIONS_PLAYBOOKS.filter((p) => p.slug === "restaurant-daily");
}

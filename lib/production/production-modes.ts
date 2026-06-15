import type { BusinessType, ProductionCommandMode } from "@prisma/client";

/** Command-center operating modes (planning taxonomy). */
export const PRODUCTION_MODES: readonly ProductionCommandMode[] = [
  "DAILY_PREP",
  "SERVICE_PREP",
  "BATCH_PRODUCTION",
  "WEEKLY_MEAL_PREP",
  "EVENT_PRODUCTION",
  "BAKERY_BATCH",
  "BAR_PREP",
  "CAFE_MORNING_PREP",
  "GHOST_KITCHEN_RUSH",
  "PACKING_HANDOFF",
] as const;

const DEFAULT_BY_BUSINESS: Record<BusinessType, ProductionCommandMode> = {
  RESTAURANT: "DAILY_PREP",
  CAFE: "CAFE_MORNING_PREP",
  BAR: "BAR_PREP",
  BAKERY: "BAKERY_BATCH",
  CATERING: "EVENT_PRODUCTION",
  MEAL_PREP: "WEEKLY_MEAL_PREP",
  GHOST_KITCHEN: "GHOST_KITCHEN_RUSH",
  CLOUD_KITCHEN: "GHOST_KITCHEN_RUSH",
  MULTI_BRAND: "GHOST_KITCHEN_RUSH",
  OTHER: "DAILY_PREP",
};

export function defaultProductionModeForBusiness(bt: BusinessType | null | undefined): ProductionCommandMode {
  if (!bt) return "DAILY_PREP";
  return DEFAULT_BY_BUSINESS[bt] ?? "DAILY_PREP";
}

/** Default Kanban / stage labels per mode (UI may override with user presets). */
export function defaultStagesForMode(mode: ProductionCommandMode): readonly string[] {
  switch (mode) {
    case "WEEKLY_MEAL_PREP":
      return ["Prep", "Cook", "Cool", "Portion", "Pack handoff", "Completed"];
    case "BAKERY_BATCH":
      return ["Mix", "Proof", "Bake", "Cool", "Package", "Ready"];
    case "BAR_PREP":
      return ["Prep garnishes", "Batch cocktails", "Stock station", "Event setup", "Completed"];
    case "EVENT_PRODUCTION":
      return ["Prep", "Cook", "Hold", "Pack", "Load", "Completed"];
    case "GHOST_KITCHEN_RUSH":
    case "PACKING_HANDOFF":
      return ["To prep", "In progress", "Ready", "Hold", "Pack handoff", "Completed"];
    case "CAFE_MORNING_PREP":
    case "SERVICE_PREP":
    case "DAILY_PREP":
    case "BATCH_PRODUCTION":
    default:
      return ["To prep", "In progress", "Ready for service", "Completed"];
  }
}

export function defaultStationsForMode(mode: ProductionCommandMode): readonly { type: string; name: string }[] {
  switch (mode) {
    case "BAR_PREP":
      return [
        { type: "BAR", name: "Bar" },
        { type: "PREP", name: "Cold prep" },
      ];
    case "BAKERY_BATCH":
      return [
        { type: "MIX", name: "Mix" },
        { type: "OVEN", name: "Oven" },
        { type: "PASTRY", name: "Pastry" },
      ];
    case "WEEKLY_MEAL_PREP":
      return [
        { type: "PREP", name: "Prep" },
        { type: "COOK", name: "Cook line" },
        { type: "PACKING", name: "Packing" },
      ];
    case "GHOST_KITCHEN_RUSH":
      return [
        { type: "PREP", name: "Prep" },
        { type: "HOT_LINE", name: "Hot line" },
        { type: "COLD_LINE", name: "Cold line" },
        { type: "PACKING", name: "Packing" },
      ];
    default:
      return [
        { type: "PREP", name: "Prep" },
        { type: "HOT_LINE", name: "Hot line" },
        { type: "COLD_LINE", name: "Cold line" },
        { type: "PASTRY", name: "Pastry" },
        { type: "PACKING", name: "Packing" },
      ];
  }
}

export type ProductionEmptyStateCopy = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHint: "generate" | "products" | "orders";
  secondaryLabel: string;
  secondaryHref: string;
};

export function productionEmptyStateForBusiness(bt: BusinessType | null | undefined): ProductionEmptyStateCopy {
  switch (bt) {
    case "RESTAURANT":
      return {
        title: "No prep tasks yet",
        description:
          "Generate a daily prep list from today’s menu, orders, or manual tasks so the kitchen knows what needs to be ready before service.",
        primaryLabel: "Generate prep list",
        primaryHint: "generate",
        secondaryLabel: "Menu items",
        secondaryHref: "/dashboard/products",
      };
    case "CAFE":
      return {
        title: "No prep or baking tasks yet",
        description: "Plan morning prep, baked goods, drink station setup, and pickup orders for today.",
        primaryLabel: "Create café prep list",
        primaryHint: "generate",
        secondaryLabel: "Menu items",
        secondaryHref: "/dashboard/products",
      };
    case "BAR":
      return {
        title: "No bar prep tasks yet",
        description: "Prepare garnishes, batch cocktails, stock stations, and plan private event setup.",
        primaryLabel: "Create bar prep list",
        primaryHint: "generate",
        secondaryLabel: "Menu items",
        secondaryHref: "/dashboard/products",
      };
    case "BAKERY":
      return {
        title: "No batch production yet",
        description: "Create batches from preorder items, pickup slots, custom orders, or baking templates.",
        primaryLabel: "Create bakery batch",
        primaryHint: "generate",
        secondaryLabel: "Menu items",
        secondaryHref: "/dashboard/products",
      };
    case "CATERING":
      return {
        title: "No event production yet",
        description: "Turn catering quotes or event orders into prep, cooking, packing, and loading tasks.",
        primaryLabel: "Create event production plan",
        primaryHint: "generate",
        secondaryLabel: "Orders",
        secondaryHref: "/dashboard/orders",
      };
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return {
        title: "No production load yet",
        description: "Pull orders from connected channels and group production by brand, station, and priority.",
        primaryLabel: "Generate production board",
        primaryHint: "generate",
        secondaryLabel: "Order hub",
        secondaryHref: "/dashboard/orders",
      };
    case "MEAL_PREP":
    default:
      return {
        title: "No production tasks yet",
        description:
          "Generate production from weekly preorders, prepared dates, recipes, and packing requirements.",
        primaryLabel: "Generate meal prep production",
        primaryHint: "generate",
        secondaryLabel: "Menu items",
        secondaryHref: "/dashboard/products",
      };
  }
}

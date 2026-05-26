import type { BusinessType } from "@prisma/client";

export type ExecutiveTerminology = {
  pageTitle: string;
  pageSubtitle: string;
  focusBullets: string[];
};

export function executiveTerminologyForMode(
  mode: BusinessType | null | undefined,
): ExecutiveTerminology {
  switch (mode) {
    case "RESTAURANT":
      return {
        pageTitle: "Executive dashboard",
        pageSubtitle:
          "Owner-level snapshot of restaurant sales, kitchen throughput, delivery / takeout, and repeat customers.",
        focusBullets: [
          "Sales by menu and channel",
          "Kitchen throughput and bottlenecks",
          "Pickup / delivery on-time rate",
          "Repeat-customer mix",
        ],
      };
    case "CAFE":
      return {
        pageTitle: "Café command center",
        pageSubtitle:
          "Daily revenue, rush periods, pickup orders, and regular customers.",
        focusBullets: [
          "Morning rush throughput",
          "Daily specials performance",
          "Pickup-order flow",
          "Regular customer ratio",
        ],
      };
    case "BAR":
      return {
        pageTitle: "Bar executive dashboard",
        pageSubtitle:
          "Private events, drinks/items performance, and staff task health. No alcohol-compliance claims.",
        focusBullets: [
          "Event bookings and revenue",
          "Top drink / item sales",
          "Staff task completion",
          "Weekend revenue trend",
        ],
      };
    case "BAKERY":
      return {
        pageTitle: "Bakery executive dashboard",
        pageSubtitle:
          "Preorders, batch production, pickup windows, and allergen-label readiness.",
        focusBullets: [
          "Preorder pipeline",
          "Batch production completion",
          "Pickup window utilisation",
          "Allergen / nutrition label coverage",
        ],
      };
    case "CATERING":
      return {
        pageTitle: "Catering executive dashboard",
        pageSubtitle:
          "Quote pipeline, event revenue, and production / load-out readiness.",
        focusBullets: [
          "Quote pipeline value",
          "Accepted events upcoming",
          "Event profitability estimate",
          "Loadout readiness checklist",
        ],
      };
    case "MEAL_PREP":
      return {
        pageTitle: "Meal prep executive dashboard",
        pageSubtitle:
          "Weekly menu revenue, meal plans, packing / route health, and nutrition labels.",
        focusBullets: [
          "Recurring meal-plan revenue",
          "Packing accuracy",
          "Delivery route on-time",
          "Active subscribers and churn",
        ],
      };
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return {
        pageTitle: "Ghost kitchen executive dashboard",
        pageSubtitle:
          "Brand / channel performance, production load, and marketplace mix.",
        focusBullets: [
          "Top brand by revenue",
          "Channel mix",
          "Production by brand",
          "Failed channel syncs",
        ],
      };
    default:
      return {
        pageTitle: "Executive dashboard",
        pageSubtitle:
          "Owner-level business health, revenue, operations, risks, and next actions.",
        focusBullets: [
          "Revenue and order trend",
          "Operations health",
          "Inventory and purchasing risks",
          "Repeat customers",
        ],
      };
  }
}

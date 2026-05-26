import type { BusinessType, PackingCommandMode } from "@prisma/client";

export const PACKING_COMMAND_MODES: readonly PackingCommandMode[] = [
  "MEAL_PREP_PACKING",
  "TAKEOUT_PACKING",
  "DELIVERY_PACKING",
  "PICKUP_PACKING",
  "CATERING_PACKING",
  "EVENT_LOADOUT",
  "BAKERY_PICKUP",
  "CAFE_PICKUP",
  "GHOST_KITCHEN_PACKING",
  "ROUTE_HANDOFF",
] as const;

const DEFAULT_BY_BUSINESS: Record<BusinessType, PackingCommandMode> = {
  MEAL_PREP: "MEAL_PREP_PACKING",
  RESTAURANT: "TAKEOUT_PACKING",
  CAFE: "CAFE_PICKUP",
  BAR: "EVENT_LOADOUT",
  BAKERY: "BAKERY_PICKUP",
  CATERING: "CATERING_PACKING",
  GHOST_KITCHEN: "GHOST_KITCHEN_PACKING",
  CLOUD_KITCHEN: "GHOST_KITCHEN_PACKING",
  MULTI_BRAND: "GHOST_KITCHEN_PACKING",
  OTHER: "PICKUP_PACKING",
};

export function defaultPackingModeForBusiness(bt: BusinessType | null | undefined): PackingCommandMode {
  if (!bt) return "PICKUP_PACKING";
  return DEFAULT_BY_BUSINESS[bt] ?? "PICKUP_PACKING";
}

export function packingModeLabel(mode: PackingCommandMode): string {
  const labels: Record<PackingCommandMode, string> = {
    MEAL_PREP_PACKING: "Meal prep packing",
    TAKEOUT_PACKING: "Takeout packing",
    DELIVERY_PACKING: "Delivery packing",
    PICKUP_PACKING: "Pickup packing",
    CATERING_PACKING: "Catering / events",
    EVENT_LOADOUT: "Event loadout",
    BAKERY_PICKUP: "Bakery pickup",
    CAFE_PICKUP: "Café pickup",
    GHOST_KITCHEN_PACKING: "Ghost kitchen",
    ROUTE_HANDOFF: "Route handoff",
  };
  return labels[mode] ?? mode;
}

export type PackingEmptyStateCopy = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export function defaultRequiresLabelForMode(mode: PackingCommandMode): boolean {
  switch (mode) {
    case "MEAL_PREP_PACKING":
    case "BAKERY_PICKUP":
    case "CATERING_PACKING":
    case "GHOST_KITCHEN_PACKING":
      return true;
    default:
      return false;
  }
}

export function packingEmptyStateForBusiness(bt: BusinessType | null | undefined): PackingEmptyStateCopy {
  switch (bt) {
    case "MEAL_PREP":
      return {
        title: "No meals in the packing queue",
        description:
          "Generate packing tasks from completed production, weekly preorders, or prepared dates so staff can pack by customer, route, and label requirements.",
        primaryLabel: "Generate packing queue",
        primaryHref: "#generate-queue",
        secondaryLabel: "Kitchen production",
        secondaryHref: "/dashboard/production",
      };
    case "RESTAURANT":
      return {
        title: "No takeout orders ready to pack",
        description:
          "Orders will appear here when they are ready for handoff from kitchen production or Order Hub.",
        primaryLabel: "Open Order Hub",
        primaryHref: "/dashboard/order-hub",
        secondaryLabel: "Kitchen production",
        secondaryHref: "/dashboard/production",
      };
    case "CAFE":
      return {
        title: "No pickup orders ready",
        description: "Pickup orders and daily special preorders will appear here when ready to bag and label.",
        primaryLabel: "View today’s orders",
        primaryHref: "/dashboard/order-hub",
        secondaryLabel: "Kitchen production",
        secondaryHref: "/dashboard/production",
      };
    case "BAKERY":
      return {
        title: "No bakery pickup queue yet",
        description:
          "Preorders, custom orders, and batch items will appear here by pickup window once production is ready.",
        primaryLabel: "Generate bakery pickup queue",
        primaryHref: "#generate-queue",
        secondaryLabel: "Kitchen production",
        secondaryHref: "/dashboard/production",
      };
    case "CATERING":
      return {
        title: "No event packing plan yet",
        description:
          "Turn catering events into packing checklists, labels, delivery manifests, and loadout tasks.",
        primaryLabel: "Create event packing plan",
        primaryHref: "#generate-queue",
        secondaryLabel: "Catering",
        secondaryHref: "/dashboard/catering",
      };
    case "BAR":
      return {
        title: "No event loadout yet",
        description:
          "Private event items, bar prep, and supplies can be grouped into event loadout lists. Alcohol service must comply with local law — KitchenOS does not provide legal advice.",
        primaryLabel: "Create event loadout",
        primaryHref: "#generate-queue",
        secondaryLabel: "Kitchen production",
        secondaryHref: "/dashboard/production",
      };
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return {
        title: "No packing load yet",
        description:
          "Pull orders from channels and group packing by brand, route, and fulfillment type. Generate a queue when production marks items ready for packing.",
        primaryLabel: "Generate packing queue",
        primaryHref: "#generate-queue",
        secondaryLabel: "Order hub",
        secondaryHref: "/dashboard/order-hub",
      };
    default:
      return {
        title: "Nothing in the packing queue",
        description:
          "Confirm orders are moving through kitchen production, then they surface here for labels, verification, and exports.",
        primaryLabel: "Generate packing queue",
        primaryHref: "#generate-queue",
        secondaryLabel: "Order hub",
        secondaryHref: "/dashboard/order-hub",
      };
  }
}

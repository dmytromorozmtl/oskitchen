import type { BusinessType } from "@prisma/client";

export function packingPageTitle(bt: BusinessType | null | undefined): string {
  switch (bt) {
    case "RESTAURANT":
      return "Takeout Packing";
    case "CAFE":
      return "Pickup Packing";
    case "BAR":
      return "Event Loadout";
    case "BAKERY":
      return "Pickup & Labels";
    case "CATERING":
      return "Event Packing & Loadout";
    case "MEAL_PREP":
      return "Packing & Labels";
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return "Packing Command Center";
    default:
      return "Packing & Labels";
  }
}

export function packingPageSubtitle(): string {
  return "Queue, verify, label, and export — fulfillment lanes for pickup, delivery, and events.";
}

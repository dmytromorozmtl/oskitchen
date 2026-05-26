import type { BusinessType } from "@prisma/client";

/** Page title + nav label by workspace business type (Phase 18 terminology). */
export function productionPageTitle(bt: BusinessType | null | undefined): string {
  switch (bt) {
    case "RESTAURANT":
      return "Prep List & Production";
    case "CAFE":
      return "Prep & Baking";
    case "BAR":
      return "Bar Prep";
    case "BAKERY":
      return "Batch Production";
    case "CATERING":
      return "Event Production";
    case "MEAL_PREP":
      return "Meal Prep Production";
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return "Production Command Center";
    default:
      return "Prep List & Production";
  }
}

export function productionTaskWord(bt: BusinessType | null | undefined): string {
  switch (bt) {
    case "RESTAURANT":
    case "CAFE":
      return "Prep tasks";
    case "BAR":
      return "Bar prep tasks";
    case "BAKERY":
      return "Batch tasks";
    case "CATERING":
      return "Event tasks";
    case "MEAL_PREP":
      return "Production tasks";
    default:
      return "Tasks";
  }
}

export function productionPageSubtitle(): string {
  return "Plan prep, batches, and handoffs — then execute on the Kitchen Screen with large touch targets.";
}

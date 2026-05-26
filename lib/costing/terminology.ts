import type { BusinessType } from "@prisma/client";

/** Page title for the profitability command center by kitchen business type. */
export function costingCommandCenterTitle(businessType: BusinessType | null | undefined): string {
  switch (businessType) {
    case "RESTAURANT":
      return "Recipe costing & menu margins";
    case "CAFE":
      return "Item costing & specials margin";
    case "BAR":
      return "Drink costing & pour margin";
    case "BAKERY":
      return "Batch costing & product margin";
    case "CATERING":
      return "Package costing & event margin";
    case "MEAL_PREP":
      return "Meal costing & weekly menu margin";
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return "Brand & channel margin";
    default:
      return "Profitability command center";
  }
}

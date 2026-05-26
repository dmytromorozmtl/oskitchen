import type { BusinessType } from "@prisma/client";

import type { OnboardingStepId, OperatingModelId } from "./onboarding-types";

/** Whether the weekly menu creation step should appear. */
export function shouldShowWeeklyMenuStep(
  businessType: BusinessType | null | undefined,
  operatingModel: OperatingModelId | null | undefined,
): boolean {
  const bt = businessType ?? "MEAL_PREP";
  // Weekly preorder cycle — meal prep & bakery only (not café / bar / restaurant).
  if (bt !== "MEAL_PREP" && bt !== "BAKERY") return false;
  if (operatingModel === "MANUAL_ONLY") return false;
  if (operatingModel === "CATERING_QUOTES_EVENTS" || operatingModel === "STOREFRONT") return false;
  if (operatingModel === "WEEKLY_PREORDERS" || operatingModel === "BAKERY_CUSTOM_PREORDERS") return true;
  if (bt === "MEAL_PREP") {
    if (operatingModel === "WALK_IN_DAILY") return false;
    return true;
  }
  if (bt === "BAKERY" && operatingModel !== "WALK_IN_DAILY") return true;
  return false;
}

export function shouldShowFulfillmentStep(operatingModel: OperatingModelId | null | undefined): boolean {
  if (operatingModel === "MANUAL_ONLY") return false;
  return true;
}

export function shouldShowBrandsLocationsStep(businessType: BusinessType | null | undefined): boolean {
  const bt = businessType ?? "OTHER";
  return bt === "GHOST_KITCHEN" || bt === "CLOUD_KITCHEN" || bt === "MULTI_BRAND";
}

export function shouldShowMenuItemsStep(
  businessType: BusinessType | null | undefined,
  operatingModel: OperatingModelId | null | undefined,
): boolean {
  if (operatingModel === "MANUAL_ONLY") return true;
  if (shouldShowWeeklyMenuStep(businessType, operatingModel)) return true;
  const bt = businessType ?? "OTHER";
  if (bt === "RESTAURANT" || bt === "CAFE" || bt === "BAR" || bt === "CATERING") return true;
  if (bt === "GHOST_KITCHEN" || bt === "CLOUD_KITCHEN" || bt === "MULTI_BRAND") return true;
  return false;
}

export function mapOperatingModelToWorkflowId(model: OperatingModelId | null | undefined): string {
  switch (model) {
    case "WALK_IN_DAILY":
      return "restaurant-daily";
    case "PICKUP":
      return "cafe-morning";
    case "DELIVERY":
      return "cafe-morning";
    case "WEEKLY_PREORDERS":
      return "meal-prep-weekly";
    case "CATERING_QUOTES_EVENTS":
      return "catering-event";
    case "BAKERY_CUSTOM_PREORDERS":
      return "bakery-preorder-day";
    case "STOREFRONT":
      return "meal-prep-weekly";
    case "SHOPIFY_WOO_MARKETPLACE":
      return "ghost-kitchen-rush";
    case "MANUAL_ONLY":
      return "manual-orders-only";
    default:
      return "meal-prep-weekly";
  }
}

export function defaultOperatingModelForBusinessType(
  businessType: BusinessType | null | undefined,
): OperatingModelId {
  const bt = businessType ?? "MEAL_PREP";
  switch (bt) {
    case "MEAL_PREP":
      return "WEEKLY_PREORDERS";
    case "RESTAURANT":
      return "WALK_IN_DAILY";
    case "CAFE":
      return "PICKUP";
    case "BAR":
      return "WALK_IN_DAILY";
    case "BAKERY":
      return "BAKERY_CUSTOM_PREORDERS";
    case "CATERING":
      return "CATERING_QUOTES_EVENTS";
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return "SHOPIFY_WOO_MARKETPLACE";
    default:
      return "WALK_IN_DAILY";
  }
}

/** Insert conditional steps into the ordered flow. */
export function buildOnboardingStepOrder(input: {
  businessType: BusinessType | null | undefined;
  operatingModel: OperatingModelId | null | undefined;
}): OnboardingStepId[] {
  const { businessType, operatingModel } = input;
  const op = operatingModel ?? null;
  const steps: OnboardingStepId[] = ["welcome", "business_profile", "operating_model"];

  if (shouldShowBrandsLocationsStep(businessType)) {
    steps.push("brands_locations");
  }
  if (shouldShowFulfillmentStep(op)) {
    steps.push("fulfillment");
  }
  if (shouldShowWeeklyMenuStep(businessType, op)) {
    steps.push("weekly_menu");
  }
  if (shouldShowMenuItemsStep(businessType, op)) {
    steps.push("menu_items");
  }
  steps.push("sales_channels", "recommended_modules", "finish");
  return steps;
}

import type {
  BusinessType,
  MealPlanBillingMode,
  MealPlanFrequency,
  MealPlanFulfillmentMode,
  MealPlanGenerationMode,
  MealPlanType,
} from "@prisma/client";

export const MEAL_PLAN_TYPE_VALUES = [
  "INDIVIDUAL",
  "FAMILY",
  "CORPORATE_LUNCH",
  "OFFICE_ROTATION",
  "FITNESS_PLAN",
  "SENIOR_MEALS",
  "CUSTOM",
  "TRIAL_PLAN",
] as const satisfies readonly MealPlanType[];

export const MEAL_PLAN_TYPE_LABEL: Record<MealPlanType, string> = {
  INDIVIDUAL: "Individual",
  FAMILY: "Family",
  CORPORATE_LUNCH: "Corporate lunch",
  OFFICE_ROTATION: "Office rotation",
  FITNESS_PLAN: "Fitness plan",
  SENIOR_MEALS: "Senior meals",
  CUSTOM: "Custom",
  TRIAL_PLAN: "Trial",
};

export const MEAL_PLAN_FREQUENCY_VALUES = [
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "CUSTOM_RRULE",
] as const satisfies readonly MealPlanFrequency[];

export const MEAL_PLAN_FREQUENCY_LABEL: Record<MealPlanFrequency, string> = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Biweekly",
  MONTHLY: "Monthly",
  CUSTOM_RRULE: "Custom (RRULE)",
};

export const MEAL_PLAN_FULFILLMENT_VALUES = [
  "PICKUP",
  "DELIVERY",
  "MIXED",
] as const satisfies readonly MealPlanFulfillmentMode[];

export const MEAL_PLAN_FULFILLMENT_LABEL: Record<MealPlanFulfillmentMode, string> = {
  PICKUP: "Pickup",
  DELIVERY: "Delivery",
  MIXED: "Mixed",
};

export const MEAL_PLAN_BILLING_VALUES = [
  "PAY_LATER",
  "MANUAL_INVOICE",
  "STRIPE_PLACEHOLDER",
  "FREE_TRIAL",
] as const satisfies readonly MealPlanBillingMode[];

export const MEAL_PLAN_BILLING_LABEL: Record<MealPlanBillingMode, string> = {
  PAY_LATER: "Pay later",
  MANUAL_INVOICE: "Manual invoice",
  STRIPE_PLACEHOLDER: "Stripe (placeholder — not connected)",
  FREE_TRIAL: "Free trial",
};

export const MEAL_PLAN_GENERATION_VALUES = [
  "MANUAL_ONLY",
  "PREVIEW_BEFORE_CREATE",
  "AUTO_CREATE_DRAFT_ORDERS",
  "AUTO_CREATE_CONFIRMED_ORDERS",
] as const satisfies readonly MealPlanGenerationMode[];

export const MEAL_PLAN_GENERATION_LABEL: Record<MealPlanGenerationMode, string> = {
  MANUAL_ONLY: "Manual only",
  PREVIEW_BEFORE_CREATE: "Preview before creating",
  AUTO_CREATE_DRAFT_ORDERS: "Auto-create draft orders",
  AUTO_CREATE_CONFIRMED_ORDERS: "Auto-confirm (disabled)",
};

/**
 * Auto-confirmed generation is reserved for a future milestone (would need a
 * payment integration). The UI rejects it; this flag drives the rendering.
 */
export function isMealPlanGenerationModeAllowed(mode: MealPlanGenerationMode): boolean {
  return mode !== "AUTO_CREATE_CONFIRMED_ORDERS";
}

export type MealPlanTerminology = {
  pageTitle: string;
  pageSubtitle: string;
  customersHeading: string;
  newCtaLabel: string;
};

export function mealPlanTerminologyForMode(mode: BusinessType | null | undefined): MealPlanTerminology {
  switch (mode) {
    case "MEAL_PREP":
      return {
        pageTitle: "Meal Subscriptions",
        pageSubtitle: "Manage recurring meal customers, cycles, selections, and draft orders.",
        customersHeading: "Subscribers",
        newCtaLabel: "New meal subscription",
      };
    case "CATERING":
      return {
        pageTitle: "Recurring Meal Plans",
        pageSubtitle: "Office lunches, corporate rotations, and recurring event-style plans.",
        customersHeading: "Clients",
        newCtaLabel: "New recurring plan",
      };
    case "CAFE":
      return {
        pageTitle: "Recurring Meal Plans",
        pageSubtitle: "Office breakfast and weekly box rotations.",
        customersHeading: "Clients",
        newCtaLabel: "New plan",
      };
    case "BAKERY":
      return {
        pageTitle: "Weekly Boxes",
        pageSubtitle: "Pastry, bread, and preorder bundle subscriptions.",
        customersHeading: "Subscribers",
        newCtaLabel: "New weekly box",
      };
    case "RESTAURANT":
      return {
        pageTitle: "Meal Plans",
        pageSubtitle: "Family bundles and recurring orders.",
        customersHeading: "Customers",
        newCtaLabel: "New plan",
      };
    case "BAR":
      return {
        pageTitle: "Recurring Packages",
        pageSubtitle: "Event packages and recurring private bookings.",
        customersHeading: "Clients",
        newCtaLabel: "New package",
      };
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return {
        pageTitle: "Meal Plans",
        pageSubtitle: "Recurring customers across brands and channels.",
        customersHeading: "Subscribers",
        newCtaLabel: "New plan",
      };
    default:
      return {
        pageTitle: "Meal Plans",
        pageSubtitle: "Manage recurring meal customers, cycles, selections, draft orders, fulfillment, production, and follow-ups.",
        customersHeading: "Customers",
        newCtaLabel: "New meal plan",
      };
  }
}

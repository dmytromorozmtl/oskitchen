import type {
  BusinessType,
  CateringEventType,
  CateringPricingMode,
  CateringQuoteLineType,
  CateringServiceStyle,
} from "@prisma/client";

export const CATERING_EVENT_TYPE_VALUES = [
  "CORPORATE_LUNCH",
  "WEDDING",
  "PRIVATE_PARTY",
  "OFFICE_EVENT",
  "BAR_EVENT",
  "HOLIDAY_EVENT",
  "DROP_OFF_CATERING",
  "FULL_SERVICE_CATERING",
  "PICKUP_CATERING",
  "CUSTOM",
] as const satisfies readonly CateringEventType[];

export const CATERING_EVENT_TYPE_LABEL: Record<CateringEventType, string> = {
  CORPORATE_LUNCH: "Corporate lunch",
  WEDDING: "Wedding",
  PRIVATE_PARTY: "Private party",
  OFFICE_EVENT: "Office event",
  BAR_EVENT: "Bar event",
  HOLIDAY_EVENT: "Holiday event",
  DROP_OFF_CATERING: "Drop-off catering",
  FULL_SERVICE_CATERING: "Full-service catering",
  PICKUP_CATERING: "Pickup catering",
  CUSTOM: "Custom",
};

export const CATERING_SERVICE_STYLE_VALUES = [
  "DROP_OFF",
  "PICKUP",
  "BUFFET",
  "FAMILY_STYLE",
  "PLATED",
  "BOXED_MEALS",
  "TRAYS",
  "BAR_SERVICE_PLACEHOLDER",
  "CUSTOM",
] as const satisfies readonly CateringServiceStyle[];

export const CATERING_SERVICE_STYLE_LABEL: Record<CateringServiceStyle, string> = {
  DROP_OFF: "Drop-off",
  PICKUP: "Pickup",
  BUFFET: "Buffet",
  FAMILY_STYLE: "Family style",
  PLATED: "Plated",
  BOXED_MEALS: "Boxed meals",
  TRAYS: "Trays",
  BAR_SERVICE_PLACEHOLDER: "Bar service (placeholder)",
  CUSTOM: "Custom",
};

export const CATERING_PRICING_MODE_VALUES = [
  "FIXED",
  "PER_PERSON",
  "PER_PACKAGE",
  "PER_TRAY",
  "HOURLY_SERVICE",
  "CUSTOM_QUOTE",
] as const satisfies readonly CateringPricingMode[];

export const CATERING_PRICING_MODE_LABEL: Record<CateringPricingMode, string> = {
  FIXED: "Fixed total",
  PER_PERSON: "Per person",
  PER_PACKAGE: "Per package",
  PER_TRAY: "Per tray",
  HOURLY_SERVICE: "Hourly service",
  CUSTOM_QUOTE: "Custom quote",
};

export const CATERING_LINE_TYPE_VALUES = [
  "FOOD",
  "BEVERAGE",
  "SERVICE",
  "DELIVERY",
  "SETUP",
  "STAFFING",
  "RENTAL",
  "DISCOUNT",
  "CUSTOM",
] as const satisfies readonly CateringQuoteLineType[];

export const CATERING_LINE_TYPE_LABEL: Record<CateringQuoteLineType, string> = {
  FOOD: "Food",
  BEVERAGE: "Beverage",
  SERVICE: "Service",
  DELIVERY: "Delivery",
  SETUP: "Setup",
  STAFFING: "Staffing",
  RENTAL: "Rental",
  DISCOUNT: "Discount",
  CUSTOM: "Custom",
};

export type CateringTerminology = {
  pageTitle: string;
  pageSubtitle: string;
  newCtaLabel: string;
  pipelineLabel: string;
};

export function cateringTerminologyForMode(mode: BusinessType | null | undefined): CateringTerminology {
  switch (mode) {
    case "CATERING":
      return {
        pageTitle: "Catering Quotes",
        pageSubtitle: "Manage catering leads, proposals, revisions, approvals, follow-ups, and event handoff.",
        newCtaLabel: "New quote",
        pipelineLabel: "Catering pipeline",
      };
    case "BAR":
      return {
        pageTitle: "Event Requests & Quotes",
        pageSubtitle: "Manage private event requests, packages, staffing, and setup.",
        newCtaLabel: "New event request",
        pipelineLabel: "Event pipeline",
      };
    case "BAKERY":
      return {
        pageTitle: "Custom Orders & Event Quotes",
        pageSubtitle: "Quote cakes, event pastry orders, and seasonal custom orders.",
        newCtaLabel: "New custom order",
        pipelineLabel: "Custom order pipeline",
      };
    case "CAFE":
      return {
        pageTitle: "Corporate Orders & Quotes",
        pageSubtitle: "Office breakfast, lunch drop-offs, and recurring corporate orders.",
        newCtaLabel: "New corporate quote",
        pipelineLabel: "Corporate pipeline",
      };
    case "MEAL_PREP":
      return {
        pageTitle: "Corporate Meal Quotes",
        pageSubtitle: "Corporate meal proposals — convert accepted quotes into orders or hand off to Meal Plans for recurring schedules.",
        newCtaLabel: "New corporate quote",
        pipelineLabel: "Corporate pipeline",
      };
    case "RESTAURANT":
      return {
        pageTitle: "Catering & Large Party Quotes",
        pageSubtitle: "Catering, large parties, and private bookings.",
        newCtaLabel: "New quote",
        pipelineLabel: "Pipeline",
      };
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return {
        pageTitle: "Catering Quotes",
        pageSubtitle: "Brand-specific catering and event proposals.",
        newCtaLabel: "New quote",
        pipelineLabel: "Pipeline",
      };
    default:
      return {
        pageTitle: "Catering Quotes",
        pageSubtitle: "Manage catering leads, proposals, revisions, approvals, follow-ups, and event handoff.",
        newCtaLabel: "New quote",
        pipelineLabel: "Pipeline",
      };
  }
}

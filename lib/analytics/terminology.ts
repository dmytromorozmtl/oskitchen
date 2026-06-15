import type { BusinessType } from "@prisma/client";

export type AnalyticsTerminology = {
  pageTitle: string;
  pageSubtitle: string;
};

export function analyticsTerminologyForMode(mode: BusinessType | null | undefined): AnalyticsTerminology {
  const baseSubtitle =
    "Operational, revenue, customer, production, and channel intelligence grounded in live business data.";
  switch (mode) {
    case "RESTAURANT":
      return { pageTitle: "Restaurant Analytics", pageSubtitle: baseSubtitle };
    case "CAFE":
      return { pageTitle: "Café Performance", pageSubtitle: baseSubtitle };
    case "BAR":
      return { pageTitle: "Bar Operations & Events", pageSubtitle: baseSubtitle };
    case "BAKERY":
      return { pageTitle: "Bakery Analytics", pageSubtitle: baseSubtitle };
    case "CATERING":
      return { pageTitle: "Catering & Events Analytics", pageSubtitle: baseSubtitle };
    case "MEAL_PREP":
      return { pageTitle: "Meal Prep Intelligence", pageSubtitle: baseSubtitle };
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return { pageTitle: "Multi-Brand Analytics", pageSubtitle: baseSubtitle };
    default:
      return { pageTitle: "Analytics", pageSubtitle: baseSubtitle };
  }
}

import type { BusinessType } from "@prisma/client";

export type ReportTerminology = {
  pageTitle: string;
  pageSubtitle: string;
  primaryCtaLabel: string;
  weeklyFocus: string;
};

export function reportTerminologyForMode(mode: BusinessType | null | undefined): ReportTerminology {
  switch (mode) {
    case "RESTAURANT":
      return {
        pageTitle: "Reports",
        pageSubtitle:
          "Generate restaurant sales, kitchen, pickup/delivery, customer, and margin reports from your workspace data.",
        primaryCtaLabel: "Create report",
        weeklyFocus: "Review sales by menu, kitchen performance, and repeat-customer mix every Monday.",
      };
    case "CAFE":
      return {
        pageTitle: "Café reports",
        pageSubtitle:
          "Daily specials, pickup patterns, morning rush, and margin reports for your café.",
        primaryCtaLabel: "Create report",
        weeklyFocus: "Look at morning rush performance and daily specials sell-through.",
      };
    case "BAR":
      return {
        pageTitle: "Bar reports",
        pageSubtitle:
          "Event, private booking, and drinks / item sales reports. No alcohol compliance claims.",
        primaryCtaLabel: "Create report",
        weeklyFocus: "Review event bookings and weekend drinks sales every week.",
      };
    case "BAKERY":
      return {
        pageTitle: "Bakery reports",
        pageSubtitle:
          "Preorder, batch production, and allergen/label reports for your bakery.",
        primaryCtaLabel: "Create report",
        weeklyFocus: "Review pre-orders, batch production, and allergen labels weekly.",
      };
    case "CATERING":
      return {
        pageTitle: "Catering reports",
        pageSubtitle:
          "Quote pipeline, accepted events, event profitability, and load-out reports.",
        primaryCtaLabel: "Create report",
        weeklyFocus: "Review the catering pipeline and accepted events for the upcoming week.",
      };
    case "MEAL_PREP":
      return {
        pageTitle: "Meal prep reports",
        pageSubtitle:
          "Weekly menu, meal plans, packing accuracy, and delivery route reports.",
        primaryCtaLabel: "Create report",
        weeklyFocus: "Review meal plan retention, packing accuracy, and route on-time delivery.",
      };
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return {
        pageTitle: "Ghost kitchen reports",
        pageSubtitle:
          "Brand performance, channel performance, and production by brand reports.",
        primaryCtaLabel: "Create report",
        weeklyFocus: "Compare brand-level performance and channel mix weekly.",
      };
    default:
      return {
        pageTitle: "Reports",
        pageSubtitle:
          "Generate operational, sales, production, delivery, customer, inventory, and margin reports from your workspace data.",
        primaryCtaLabel: "Create report",
        weeklyFocus: "Review revenue, repeat customers, production completion, and margin risks weekly.",
      };
  }
}

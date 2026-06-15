import type {
  ForecastConfidence,
  ForecastSourceType,
  ForecastType,
  BusinessType,
} from "@prisma/client";

export const FORECAST_TYPE_VALUES: ForecastType[] = [
  "ORDER_DEMAND",
  "PRODUCT_DEMAND",
  "PRODUCTION_LOAD",
  "INGREDIENT_DEMAND",
  "STAFFING_LOAD",
  "PACKING_LOAD",
  "ROUTE_LOAD",
  "CATERING_LOAD",
  "MEAL_PLAN_LOAD",
  "CHANNEL_DEMAND",
];

export const FORECAST_TYPE_LABEL: Record<ForecastType, string> = {
  ORDER_DEMAND: "Order demand",
  PRODUCT_DEMAND: "Product demand",
  PRODUCTION_LOAD: "Production load",
  INGREDIENT_DEMAND: "Ingredient demand",
  STAFFING_LOAD: "Staffing load",
  PACKING_LOAD: "Packing load",
  ROUTE_LOAD: "Route load",
  CATERING_LOAD: "Catering load",
  MEAL_PLAN_LOAD: "Meal plan load",
  CHANNEL_DEMAND: "Channel demand",
};

export const FORECAST_SOURCE_VALUES: ForecastSourceType[] = [
  "HISTORICAL_ORDERS",
  "ACTIVE_MENU",
  "UPCOMING_MENU",
  "MENU_PLANNER",
  "MEAL_PLANS",
  "ACCEPTED_CATERING_EVENTS",
  "PRODUCTION_PLAN",
  "SALES_CHANNELS",
  "MANUAL_ADJUSTMENT",
  "SEASONAL_FACTOR",
];

export const FORECAST_SOURCE_LABEL: Record<ForecastSourceType, string> = {
  HISTORICAL_ORDERS: "Historical orders",
  ACTIVE_MENU: "Active menu",
  UPCOMING_MENU: "Upcoming menu",
  MENU_PLANNER: "Menu planner",
  MEAL_PLANS: "Meal plans",
  ACCEPTED_CATERING_EVENTS: "Accepted catering events",
  PRODUCTION_PLAN: "Production plan",
  SALES_CHANNELS: "Sales channels",
  MANUAL_ADJUSTMENT: "Manual adjustment",
  SEASONAL_FACTOR: "Seasonal factor",
};

export const FORECAST_CONFIDENCE_LABEL: Record<ForecastConfidence, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  MANUAL: "Manual",
};

export type ForecastTerminology = {
  pageTitle: string;
  pageSubtitle: string;
  defaultSources: ForecastSourceType[];
};

export function forecastTerminologyForMode(mode: BusinessType | null | undefined): ForecastTerminology {
  const baseSubtitle =
    "Estimate upcoming demand from orders, menus, meal plans, events, production plans, and manual adjustments.";
  switch (mode) {
    case "RESTAURANT":
      return {
        pageTitle: "Demand Forecast",
        pageSubtitle: baseSubtitle,
        defaultSources: ["HISTORICAL_ORDERS", "ACTIVE_MENU", "MANUAL_ADJUSTMENT"],
      };
    case "CAFE":
      return {
        pageTitle: "Specials & Prep Forecast",
        pageSubtitle: baseSubtitle,
        defaultSources: ["HISTORICAL_ORDERS", "MANUAL_ADJUSTMENT"],
      };
    case "BAR":
      return {
        pageTitle: "Bar / Event Forecast",
        pageSubtitle: baseSubtitle,
        defaultSources: ["HISTORICAL_ORDERS", "ACCEPTED_CATERING_EVENTS", "MANUAL_ADJUSTMENT"],
      };
    case "BAKERY":
      return {
        pageTitle: "Batch Forecast",
        pageSubtitle: baseSubtitle,
        defaultSources: ["HISTORICAL_ORDERS", "PRODUCTION_PLAN", "MANUAL_ADJUSTMENT"],
      };
    case "CATERING":
      return {
        pageTitle: "Event Load Forecast",
        pageSubtitle: baseSubtitle,
        defaultSources: ["ACCEPTED_CATERING_EVENTS", "HISTORICAL_ORDERS"],
      };
    case "MEAL_PREP":
      return {
        pageTitle: "Production Forecast",
        pageSubtitle: baseSubtitle,
        defaultSources: ["ACTIVE_MENU", "MEAL_PLANS", "HISTORICAL_ORDERS"],
      };
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return {
        pageTitle: "Multi-Brand Forecast",
        pageSubtitle: baseSubtitle,
        defaultSources: ["HISTORICAL_ORDERS", "SALES_CHANNELS", "MANUAL_ADJUSTMENT"],
      };
    default:
      return {
        pageTitle: "Forecast & Planning Center",
        pageSubtitle: baseSubtitle,
        defaultSources: ["HISTORICAL_ORDERS"],
      };
  }
}

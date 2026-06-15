import type { BusinessType, DeliveryRouteMode } from "@prisma/client";

export const ROUTE_MODE_VALUES = [
  "MEAL_PREP_DELIVERY",
  "CATERING_DELIVERY",
  "BAKERY_DELIVERY",
  "CAFE_DELIVERY",
  "RESTAURANT_DELIVERY",
  "EVENT_DELIVERY",
  "GHOST_KITCHEN_DELIVERY",
  "PICKUP_HANDOFF",
  "UBER_DIRECT_DISPATCH_PLACEHOLDER",
] as const satisfies readonly DeliveryRouteMode[];

export type RouteModeValue = (typeof ROUTE_MODE_VALUES)[number];

export const ROUTE_MODE_LABEL: Record<DeliveryRouteMode, string> = {
  MEAL_PREP_DELIVERY: "Meal prep delivery",
  CATERING_DELIVERY: "Catering delivery",
  BAKERY_DELIVERY: "Bakery delivery",
  CAFE_DELIVERY: "Café delivery",
  RESTAURANT_DELIVERY: "Restaurant delivery",
  EVENT_DELIVERY: "Event delivery / loadout",
  GHOST_KITCHEN_DELIVERY: "Ghost kitchen delivery",
  PICKUP_HANDOFF: "Pickup handoff",
  UBER_DIRECT_DISPATCH_PLACEHOLDER: "Uber Direct (placeholder)",
};

export const FAILED_REASON_LABEL = {
  CUSTOMER_UNAVAILABLE: "Customer unavailable",
  WRONG_ADDRESS: "Wrong address",
  DRIVER_ISSUE: "Driver issue",
  ORDER_NOT_PACKED: "Order not packed",
  WEATHER_TRAFFIC: "Weather / traffic",
  PAYMENT_ISSUE: "Payment issue",
  OTHER: "Other",
} as const;

export function isRouteMode(v: unknown): v is DeliveryRouteMode {
  return typeof v === "string" && (ROUTE_MODE_VALUES as readonly string[]).includes(v);
}

/** Centralized translation from BusinessType to a primary terminology + default mode. */
export function routeTerminologyForMode(business: BusinessType | null | undefined): {
  title: string;
  subtitle: string;
  defaultMode: DeliveryRouteMode;
} {
  switch (business) {
    case "CATERING":
      return {
        title: "Event delivery & loadout",
        subtitle:
          "Plan event-day delivery, setup notes, and loadout sequencing. Critical drop-off times stay visible.",
        defaultMode: "CATERING_DELIVERY",
      };
    case "BAKERY":
      return {
        title: "Pickup & delivery routes",
        subtitle:
          "Bundle preorders and custom orders by date or window. Print driver manifests and pickup sheets.",
        defaultMode: "BAKERY_DELIVERY",
      };
    case "CAFE":
      return {
        title: "Pickup / delivery runs",
        subtitle: "Short local delivery runs and pickup handoff. Add stops manually or by window.",
        defaultMode: "CAFE_DELIVERY",
      };
    case "RESTAURANT":
      return {
        title: "Delivery dispatch",
        subtitle:
          "Plan internal delivery routes or hand off to third-party dispatch placeholders (Uber Direct).",
        defaultMode: "RESTAURANT_DELIVERY",
      };
    case "BAR":
      return {
        title: "Event / private booking deliveries",
        subtitle:
          "Loadout-only routes for private events and bookings. Alcohol delivery rules vary by jurisdiction — OS Kitchen does not handle compliance.",
        defaultMode: "EVENT_DELIVERY",
      };
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return {
        title: "Delivery dispatch",
        subtitle:
          "Marketplace handoff and internal delivery grouping. Uber Direct stays a placeholder until credentials and live dispatch are wired.",
        defaultMode: "GHOST_KITCHEN_DELIVERY",
      };
    case "OTHER":
    case "MEAL_PREP":
    case null:
    case undefined:
    default:
      return {
        title: "Delivery routes",
        subtitle:
          "Bundle deliveries by date or window, assign drivers, and print manifests. Manual stop order — optimization is a future placeholder.",
        defaultMode: "MEAL_PREP_DELIVERY",
      };
  }
}

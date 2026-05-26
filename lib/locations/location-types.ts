import type { BusinessType, LocationStatus, LocationType } from "@prisma/client";

export const LOCATION_TYPE_VALUES = [
  "RESTAURANT",
  "CAFE",
  "BAR",
  "BAKERY",
  "CATERING_KITCHEN",
  "COMMISSARY",
  "GHOST_KITCHEN",
  "CLOUD_KITCHEN",
  "PICKUP_POINT",
  "DELIVERY_HUB",
  "WAREHOUSE",
  "EVENT_KITCHEN",
] as const satisfies readonly LocationType[];

export const LOCATION_TYPE_LABEL: Record<LocationType, string> = {
  RESTAURANT: "Restaurant",
  CAFE: "Café",
  BAR: "Bar",
  BAKERY: "Bakery",
  CATERING_KITCHEN: "Catering kitchen",
  COMMISSARY: "Commissary",
  GHOST_KITCHEN: "Ghost kitchen",
  CLOUD_KITCHEN: "Cloud kitchen",
  PICKUP_POINT: "Pickup point",
  DELIVERY_HUB: "Delivery hub",
  WAREHOUSE: "Warehouse",
  EVENT_KITCHEN: "Event kitchen",
};

export const LOCATION_STATUS_VALUES = [
  "ACTIVE",
  "SETUP",
  "PAUSED",
  "TEMPORARILY_CLOSED",
  "ARCHIVED",
] as const satisfies readonly LocationStatus[];

export const LOCATION_STATUS_LABEL: Record<LocationStatus, string> = {
  ACTIVE: "Active",
  SETUP: "Setup",
  PAUSED: "Paused",
  TEMPORARILY_CLOSED: "Temporarily closed",
  ARCHIVED: "Archived",
};

export const LOCATION_STATUS_BADGE: Record<LocationStatus, "default" | "secondary" | "outline" | "destructive"> = {
  ACTIVE: "default",
  SETUP: "secondary",
  PAUSED: "outline",
  TEMPORARILY_CLOSED: "outline",
  ARCHIVED: "destructive",
};

export function isLocationType(v: unknown): v is LocationType {
  return typeof v === "string" && (LOCATION_TYPE_VALUES as readonly string[]).includes(v);
}

export function isLocationStatus(v: unknown): v is LocationStatus {
  return typeof v === "string" && (LOCATION_STATUS_VALUES as readonly string[]).includes(v);
}

/**
 * Map workspace BusinessType to the default Location type when a workspace
 * adds its first location.
 */
export function defaultLocationTypeForBusiness(business: BusinessType | null | undefined): LocationType {
  switch (business) {
    case "RESTAURANT": return "RESTAURANT";
    case "CAFE":       return "CAFE";
    case "BAR":        return "BAR";
    case "BAKERY":     return "BAKERY";
    case "CATERING":   return "CATERING_KITCHEN";
    case "MEAL_PREP":  return "COMMISSARY";
    case "GHOST_KITCHEN": return "GHOST_KITCHEN";
    case "CLOUD_KITCHEN": return "CLOUD_KITCHEN";
    case "MULTI_BRAND":   return "GHOST_KITCHEN";
    case "OTHER":
    case null:
    case undefined:
    default:
      return "RESTAURANT";
  }
}

/** Slugify a name into a URL-safe location slug. */
export function slugifyLocationName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

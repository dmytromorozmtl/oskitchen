import type { FulfillmentType } from "@prisma/client";

/**
 * Widened fulfillment type. Stored in `Order.fulfillmentDetail` so we
 * don't change the existing enum.
 */
export const FULFILLMENT_DETAIL_KEYS = [
  "PICKUP",
  "DELIVERY",
  "DINE_IN",
  "EVENT_DELIVERY",
  "CATERING_LOADOUT",
  "THIRD_PARTY_DELIVERY",
  "CUSTOM",
] as const;
export type FulfillmentDetailKey = (typeof FULFILLMENT_DETAIL_KEYS)[number];

export const FULFILLMENT_LABEL: Record<FulfillmentDetailKey, string> = {
  PICKUP: "Pickup",
  DELIVERY: "Delivery",
  DINE_IN: "Dine-in",
  EVENT_DELIVERY: "Event delivery",
  CATERING_LOADOUT: "Catering loadout",
  THIRD_PARTY_DELIVERY: "Third-party delivery",
  CUSTOM: "Custom fulfillment",
};

/** Map widened fulfillment to the 2-value DB enum. */
export function toDbFulfillmentType(k: FulfillmentDetailKey): FulfillmentType {
  switch (k) {
    case "PICKUP":
    case "DINE_IN":
      return "PICKUP";
    case "DELIVERY":
    case "EVENT_DELIVERY":
    case "CATERING_LOADOUT":
    case "THIRD_PARTY_DELIVERY":
      return "DELIVERY";
    case "CUSTOM":
      return "PICKUP";
  }
}

export type DeliveryAddressJson = {
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
};

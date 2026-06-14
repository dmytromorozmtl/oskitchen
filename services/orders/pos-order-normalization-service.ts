import type { FulfillmentRequirementContext } from "@/lib/fulfillment/fulfillment-requirements";
import { inferFulfillmentIntent, requiresScheduledServiceDate } from "@/lib/fulfillment/fulfillment-requirements";
import type { PosOperationalSubtype } from "@/lib/orders/order-source-types";

export function buildFulfillmentContextFromOrder(row: {
  status: FulfillmentRequirementContext["status"];
  orderType: string | null;
  creationSource: string | null;
  fulfillmentType: FulfillmentRequirementContext["fulfillmentType"];
  fulfillmentDetail: string | null;
  pickupDate: Date | null;
  deliveryAddressJson: unknown | null;
  sourceMetadataJson: unknown;
}): FulfillmentRequirementContext {
  return {
    status: row.status,
    orderType: row.orderType,
    creationSource: row.creationSource,
    fulfillmentType: row.fulfillmentType,
    fulfillmentDetail: row.fulfillmentDetail,
    pickupDate: row.pickupDate,
    deliveryAddressJson: row.deliveryAddressJson,
    sourceMetadataJson: row.sourceMetadataJson,
  };
}

/** Maps persisted order + POS metadata to an operational POS subtype for UX and rules. */
export function resolvePosOperationalSubtype(ctx: FulfillmentRequirementContext): PosOperationalSubtype {
  if (ctx.creationSource !== "POS" || ctx.orderType !== "POS_SALE") return "POS_SALE";
  const intent = inferFulfillmentIntent(ctx);
  switch (intent) {
    case "PICKUP_NOW":
      return "POS_READY_NOW";
    case "SCHEDULED_PICKUP":
      return "POS_PICKUP";
    case "DELIVERY":
      return "POS_SALE";
    case "DINE_IN":
      return "POS_WALK_IN";
    case "CATERING_PICKUP":
      return "POS_CATERING_PICKUP";
    default:
      return "POS_SALE";
  }
}

export function posPickupDateRequired(ctx: FulfillmentRequirementContext): boolean {
  if (ctx.creationSource !== "POS" || ctx.orderType !== "POS_SALE") return false;
  return requiresScheduledServiceDate(ctx);
}

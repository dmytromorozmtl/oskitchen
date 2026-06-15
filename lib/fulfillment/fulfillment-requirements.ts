import type { FulfillmentType, OrderStatus } from "@prisma/client";

/** Coarse fulfillment intent for rules (not all persisted yet). */
export type FulfillmentIntentCode =
  | "WALK_IN"
  | "COUNTER_SALE"
  | "PICKUP_NOW"
  | "SCHEDULED_PICKUP"
  | "DELIVERY"
  | "DINE_IN"
  | "EVENT_DELIVERY"
  | "CATERING_PICKUP"
  | "THIRD_PARTY_DELIVERY"
  | "CUSTOM";

export type FulfillmentRequirementContext = {
  status: OrderStatus;
  orderType: string | null;
  creationSource: string | null;
  fulfillmentType: FulfillmentType;
  fulfillmentDetail: string | null;
  pickupDate: Date | null;
  deliveryAddressJson: unknown | null;
  sourceMetadataJson: unknown;
};

function posMeta(obj: unknown): Record<string, unknown> | null {
  if (!obj || typeof obj !== "object") return null;
  const pos = (obj as Record<string, unknown>).pos;
  if (!pos || typeof pos !== "object") return null;
  return pos as Record<string, unknown>;
}

/** True when POS metadata asks for a future scheduled pickup slot. */
export function posMetadataRequestsScheduledPickup(sourceMetadataJson: unknown): boolean {
  const p = posMeta(sourceMetadataJson);
  if (!p) return false;
  if (p.scheduledPickup === true) return true;
  return p.fulfillmentIntent === "SCHEDULED_PICKUP";
}

/**
 * Whether a **service / pickup calendar date** must be present for this order shape.
 * Walk-in POS counter pickup returns false unless scheduled intent is set.
 */
export function requiresScheduledServiceDate(ctx: FulfillmentRequirementContext): boolean {
  const detail = ctx.fulfillmentDetail ?? "PICKUP";

  if (ctx.creationSource === "POS" && ctx.orderType === "POS_SALE") {
    if (ctx.fulfillmentType === "DELIVERY") return true;
    if (["EVENT_DELIVERY", "CATERING_LOADOUT", "THIRD_PARTY_DELIVERY"].includes(detail)) return true;
    if (posMetadataRequestsScheduledPickup(ctx.sourceMetadataJson)) return true;
    return false;
  }

  if (ctx.orderType === "PREORDER" || ctx.orderType === "MEAL_PLAN_ORDER") return true;
  if (ctx.fulfillmentType === "DELIVERY") return true;
  if (ctx.fulfillmentType === "PICKUP") return true;
  return false;
}

/**
 * Calendar / service pickup date is required for this order profile but not set.
 * Aligns Today / dashboard signals with `order-blocker-service` fulfillment rules (POS ready-now excluded).
 */
export function orderMissingRequiredServiceDate(ctx: FulfillmentRequirementContext): boolean {
  if (ctx.pickupDate != null) return false;
  return requiresScheduledServiceDate(ctx);
}

export function inferFulfillmentIntent(ctx: FulfillmentRequirementContext): FulfillmentIntentCode {
  if (ctx.creationSource === "POS" && ctx.orderType === "POS_SALE") {
    if (ctx.fulfillmentType === "DELIVERY") return "DELIVERY";
    const p = posMeta(ctx.sourceMetadataJson);
    const intent = p?.fulfillmentIntent;
    if (intent === "DINE_IN") return "DINE_IN";
    if (intent === "SCHEDULED_PICKUP") return "SCHEDULED_PICKUP";
    if (detailIs(ctx.fulfillmentDetail, "DINE_IN")) return "DINE_IN";
    if (posMetadataRequestsScheduledPickup(ctx.sourceMetadataJson)) return "SCHEDULED_PICKUP";
    return "PICKUP_NOW";
  }
  if (detailIs(ctx.fulfillmentDetail, "EVENT_DELIVERY")) return "EVENT_DELIVERY";
  if (detailIs(ctx.fulfillmentDetail, "CATERING_LOADOUT")) return "CATERING_PICKUP";
  if (detailIs(ctx.fulfillmentDetail, "THIRD_PARTY_DELIVERY")) return "THIRD_PARTY_DELIVERY";
  if (ctx.fulfillmentType === "DELIVERY") return "DELIVERY";
  if (detailIs(ctx.fulfillmentDetail, "DINE_IN")) return "DINE_IN";
  return "SCHEDULED_PICKUP";
}

function detailIs(d: string | null, k: string): boolean {
  return (d ?? "").toUpperCase() === k;
}

/** Delivery orders need a structured address before ready/complete (see order lifecycle guards). */
export function requiresDeliveryAddress(ctx: Pick<FulfillmentRequirementContext, "fulfillmentType">): boolean {
  return ctx.fulfillmentType === "DELIVERY";
}

export function pickupDateDisplayLabel(ctx: FulfillmentRequirementContext): string {
  if (ctx.pickupDate) return ctx.pickupDate.toISOString().slice(0, 10);
  const intent = inferFulfillmentIntent(ctx);
  if (intent === "PICKUP_NOW" || intent === "WALK_IN" || intent === "COUNTER_SALE" || intent === "DINE_IN") {
    return "Pickup now";
  }
  return "—";
}

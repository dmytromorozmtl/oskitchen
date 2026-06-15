import type { FulfillmentRequirementContext } from "@/lib/fulfillment/fulfillment-requirements";

export function isPosCounterOrder(ctx: Pick<FulfillmentRequirementContext, "creationSource" | "orderType">): boolean {
  return ctx.creationSource === "POS" && ctx.orderType === "POS_SALE";
}

export { requiresScheduledServiceDate as posOrderRequiresScheduledServiceDate } from "@/lib/fulfillment/fulfillment-requirements";

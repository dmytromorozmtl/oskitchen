import { requiresScheduledServiceDate } from "@/lib/fulfillment/fulfillment-requirements";
import type { OrderLifecycleDeriveInput, OrderLifecycleStage } from "@/lib/orders/order-lifecycle-types";

/**
 * Derives a **coarse FoodOps stage** for UX and routing. Maps onto Prisma `OrderStatus` without
 * requiring a second persisted enum.
 */
export function deriveOrderLifecycleStage(i: OrderLifecycleDeriveInput): OrderLifecycleStage {
  if (i.dbStatus === "CANCELLED") return "CANCELLED";
  if (i.dbStatus === "COMPLETED") return "COMPLETED";
  if (i.onHoldDetail) return "ON_HOLD";
  if (i.externalSyncFailed || i.importBatchFailed) return "FAILED";

  if (i.hasUnmappedChannelLines) return "NEEDS_MAPPING";

  if (!i.customerName?.trim()) return "NEEDS_CUSTOMER_INFO";
  if (!i.customerEmail?.trim() && !i.customerPhone?.trim()) return "NEEDS_CUSTOMER_INFO";

  if (i.orderItemsCount === 0) return "DRAFT";

  if (i.dbStatus === "PENDING") {
    return "REQUESTED";
  }

  if (i.dbStatus === "CONFIRMED") {
    const needsDate = requiresScheduledServiceDate({
      status: i.dbStatus,
      orderType: i.orderType,
      creationSource: i.creationSource,
      fulfillmentType: i.fulfillmentType,
      fulfillmentDetail: i.fulfillmentDetail,
      pickupDate: i.pickupDate,
      deliveryAddressJson: i.deliveryAddressJson,
      sourceMetadataJson: i.sourceMetadataJson,
    });
    if (needsDate && i.pickupDate == null) return "NEEDS_FULFILLMENT_INFO";
    return "READY_FOR_PRODUCTION";
  }

  if (i.dbStatus === "PREPARING") {
    if (i.packingIncomplete) return "PACKING";
    if (i.productionWorkIncomplete) return "IN_PRODUCTION";
    return "PRODUCTION_COMPLETE";
  }

  if (i.dbStatus === "READY") {
    if (i.fulfillmentType === "DELIVERY") {
      return i.hasDeliveryStops ? "OUT_FOR_DELIVERY" : "OUT_FOR_DELIVERY";
    }
    return "READY_FOR_PICKUP";
  }

  return "REQUESTED";
}

import type { OrderCreationType } from "@/lib/orders/order-types";
import { ORDER_CREATION_MODES } from "@/lib/orders/order-creation-modes";

export function allowedFulfillmentDetailsForOrderType(orderType: OrderCreationType) {
  return ORDER_CREATION_MODES[orderType]?.allowedFulfillments ?? [];
}

export function defaultFulfillmentForOrderType(orderType: OrderCreationType) {
  return ORDER_CREATION_MODES[orderType]?.defaultFulfillment ?? "PICKUP";
}

import type { OrderStatus } from "@prisma/client";

import { auditLog } from "@/services/audit/audit-service";
import {
  allowedNextDbStatuses,
  type OrderLikeForLifecycle,
  validateOrderDbStatusTransition,
} from "@/lib/workflows/order-lifecycle-rules";

export type OrderNextAction = {
  title: string;
  detail: string;
  href: string;
};

export function listAllowedOrderStatusTransitions(order: OrderLikeForLifecycle): OrderStatus[] {
  return allowedNextDbStatuses(order.status).filter((candidate) => {
    const r = validateOrderDbStatusTransition(order, candidate);
    return r.ok;
  });
}

export function describeOrderNextBestAction(order: OrderLikeForLifecycle): OrderNextAction | null {
  const next = listAllowedOrderStatusTransitions(order)[0];
  if (!next) return null;
  const label: Partial<Record<OrderStatus, string>> = {
    PENDING: "Move back to pending",
    CONFIRMED: "Confirm the order",
    PREPARING: "Send to production",
    READY: "Mark ready for pickup or delivery",
    COMPLETED: "Complete the order",
    CANCELLED: "Cancel the order",
  };
  return {
    title: label[next] ?? "Update status",
    detail: `Recommended next step: move to ${next.replace(/_/g, " ").toLowerCase()}.`,
    href: `/dashboard/orders/${order.id}`,
  };
}

export async function auditOrderDbStatusChange(input: {
  userId: string;
  email: string | null;
  orderId: string;
  customerLabel: string;
  from: OrderStatus;
  to: OrderStatus;
}): Promise<void> {
  await auditLog({
    actor: { userId: input.userId, email: input.email },
    action: "ORDER_STATUS_CHANGED",
    category: "ORDERS",
    source: "USER",
    severity: input.to === "CANCELLED" ? "WARNING" : "INFO",
    entity: { type: "Order", id: input.orderId, label: input.customerLabel },
    before: { status: input.from },
    after: { status: input.to },
    maskPiiInMetadata: true,
  });
}

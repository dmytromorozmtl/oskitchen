import { logger } from "@/lib/logger";
import { sendPushToUser } from "@/services/notifications/push-service";

/** Fire-and-forget web push for kitchen staff (owner userId). */
export async function notifyOrderReadyPush(input: {
  ownerUserId: string;
  orderId: string;
  customerLabel: string;
  orderNumber?: string | null;
}): Promise<void> {
  try {
    const label = input.orderNumber ?? input.customerLabel;
    await sendPushToUser(input.ownerUserId, {
      title: "Order ready",
      body: `Order ${label} is ready for pickup or handoff.`,
      url: `/dashboard/orders/${input.orderId}`,
    });
  } catch (e) {
    logger.warn("notifyOrderReadyPush failed", e);
  }
}

export async function notifyNewOrderPush(input: {
  ownerUserId: string;
  orderId: string;
  customerLabel: string;
}): Promise<void> {
  try {
    await sendPushToUser(input.ownerUserId, {
      title: "New order",
      body: `New order from ${input.customerLabel} — open KDS.`,
      url: `/dashboard/kitchen`,
    });
  } catch (e) {
    logger.warn("notifyNewOrderPush failed", e);
  }
}

export async function notifyKdsOverduePush(input: {
  ownerUserId: string;
  overdueCount: number;
}): Promise<void> {
  if (input.overdueCount <= 0) return;
  try {
    await sendPushToUser(input.ownerUserId, {
      title: "KDS overdue",
      body: `${input.overdueCount} ticket(s) overdue 10+ minutes — check kitchen display.`,
      url: "/dashboard/kitchen",
    });
  } catch (e) {
    logger.warn("notifyKdsOverduePush failed", e);
  }
}

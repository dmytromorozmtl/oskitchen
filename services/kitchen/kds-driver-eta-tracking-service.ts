import { endOfDay, startOfDay } from "date-fns";

import {
  buildDriverEtaLabel,
  classifyDriverEtaBand,
  estimateDriverEtaMinutes,
  isGpsPingFresh,
  KDS_DRIVER_ETA_TRACKING_ABSOLUTE_FINAL_POLICY_ID,
  parseDispatchGpsPayload,
  summarizeKdsDriverEtaTracking,
  type KdsDriverEtaTicket,
  type KdsDriverEtaTrackingModel,
} from "@/lib/kitchen/kds-driver-eta-tracking-absolute-final-policy";
import { prisma } from "@/lib/prisma";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";

function ticketNumber(orderId: string): string {
  return `#${orderId.slice(0, 6).toUpperCase()}`;
}

export async function loadKdsDriverEtaTrackingModel(
  userId: string,
): Promise<KdsDriverEtaTrackingModel> {
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(today);
  const now = new Date();

  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    createdAt: { gte: today, lte: tomorrow },
    status: { notIn: ["CANCELLED", "COMPLETED"] },
    fulfillmentType: "DELIVERY",
  });

  const orders = await prisma.order.findMany({
    where: orderWhere,
    select: {
      id: true,
      customerName: true,
      status: true,
      fulfillmentWindowEnd: true,
      deliveryDispatches: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: {
          status: true,
          provider: true,
          trackingUrl: true,
          rawPayloadJson: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 80,
  });

  const tickets: KdsDriverEtaTicket[] = orders.map((order) => {
    const dispatch = order.deliveryDispatches[0] ?? null;
    const dispatchStatus = dispatch?.status ?? null;
    const { pings, last } = parseDispatchGpsPayload(dispatch?.rawPayloadJson);
    const gpsFresh = isGpsPingFresh(last?.recordedAt ?? null, now.getTime());
    const windowEnd = order.fulfillmentWindowEnd;
    const etaMinutes = estimateDriverEtaMinutes({
      dispatchStatus,
      lastPing: last,
      pings,
      windowEnd,
      now,
    });
    const band = classifyDriverEtaBand({
      etaMinutes,
      windowEnd,
      dispatchStatus,
      gpsFresh,
      now,
    });

    return {
      orderId: order.id,
      ticketNumber: ticketNumber(order.id),
      customerName: order.customerName,
      kdsStatus: order.status,
      dispatchStatus,
      dispatchProvider: dispatch?.provider ?? null,
      driverLabel: last?.driverLabel ?? null,
      etaMinutes,
      etaLabel: buildDriverEtaLabel({ dispatchStatus, etaMinutes, gpsFresh }),
      band,
      gpsFresh,
      lastPingAt: last?.recordedAt ?? null,
      trackingUrl: dispatch?.trackingUrl ?? null,
      windowEnd: windowEnd?.toISOString() ?? null,
      href: `/dashboard/kitchen#ticket-${order.id}`,
    };
  });

  return {
    policyId: KDS_DRIVER_ETA_TRACKING_ABSOLUTE_FINAL_POLICY_ID,
    tickets,
    summary: summarizeKdsDriverEtaTracking(tickets),
    refreshedAt: now.toISOString(),
  };
}

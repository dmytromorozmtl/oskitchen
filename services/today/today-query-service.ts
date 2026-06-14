import { addDays, startOfDay, startOfWeek } from "date-fns";

import { prisma } from "@/lib/prisma";
import {
  externalOrderListWhereForOwner,
  externalProductListWhereForOwner,
} from "@/lib/scope/workspace-channel-scope";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { countBlockedOrdersApprox } from "@/services/orders/order-blocker-service";
import { countWebhookQueueSignals } from "@/services/today/today-operational-signals";
import { IntegrationStatus } from "@prisma/client";

/** Shared date windows for Today + related dashboards. */
export function todayDateWindows() {
  const todayStart = startOfDay(new Date());
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const tomorrow = addDays(todayStart, 1);
  return { todayStart, weekStart, tomorrow };
}

export async function loadTodayOperationalCounts(userId: string) {
  const { todayStart, tomorrow } = todayDateWindows();
  const [blockedOrdersApprox, packingQueueOpen, productionWorkOpen, confirmedOrdersToday] = await Promise.all([
    countBlockedOrdersApprox(userId),
    prisma.packingTask.count({
      where: {
        userId,
        status: { in: ["QUEUED", "IN_PROGRESS"] },
      },
    }),
    prisma.productionWorkItem.count({
      where: {
        userId,
        status: { in: ["TO_PREP", "IN_PROGRESS", "READY", "PACK_HANDOFF", "HOLD"] },
      },
    }),
    prisma.order.count({
      where: {
        userId,
        status: "CONFIRMED",
      },
    }),
  ]);
  return { blockedOrdersApprox, packingQueueOpen, productionWorkOpen, confirmedOrdersToday };
}

export async function loadTodayIntegrationSnapshot(userId: string) {
  const { unprocessedTotal, needingAttention } = await countWebhookQueueSignals(userId);
  const [externalOrderWhere, externalProductWhere, integrationScope] = await Promise.all([
    externalOrderListWhereForOwner(userId),
    externalProductListWhereForOwner(userId),
    integrationConnectionListWhereForOwner(userId),
  ]);
  const [errorIntegrations, failedExternalOrders, unmatchedExternalProducts] = await Promise.all([
    prisma.integrationConnection.count({
      where: { AND: [integrationScope, { status: IntegrationStatus.ERROR }] },
    }),
    prisma.externalOrder.count({
      where: { AND: [externalOrderWhere, { syncStatus: "FAILED" }] },
    }),
    prisma.externalProduct.count({
      where: { AND: [externalProductWhere, { mappedProductId: null }] },
    }),
  ]);
  return {
    failedWebhooks: unprocessedTotal,
    webhooksNeedingAttention: needingAttention,
    errorIntegrations,
    failedExternalOrders,
    unmatchedExternalProducts,
  };
}

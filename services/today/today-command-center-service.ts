import { addDays, startOfDay, startOfWeek } from "date-fns";

import { prisma } from "@/lib/prisma";
import {
  externalOrderListWhereForOwner,
  externalProductListWhereForOwner,
} from "@/lib/scope/workspace-channel-scope";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import {
  deliveryRouteListWhereForOwner,
  integrationConnectionListWhereForOwner,
  kitchenTaskListWhereForOwner,
  menuListWhereForOwner,
  orderChannelListWhereForOwner,
  posTransactionListWhereForOwner,
  productListWhereForOwner,
  staffMemberListWhereForOwner,
  supportTicketListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { countIntegrityIssues } from "@/services/integrity/integrity-service";
import { evaluateInventoryShortageReadiness } from "@/services/inventory/inventory-shortage-readiness-service";
import { loadTodayOperationalCounts } from "@/services/today/today-query-service";
import { computeWorkspaceReadiness } from "@/services/readiness/workspace-readiness-service";
import {
  countDeliveryOrdersWithoutRouteStops,
  countOrdersMissingRequiredServiceDate,
  countWebhookQueueSignals,
  loadOrdersDueTodayList,
} from "@/services/today/today-operational-signals";
import { IntegrationStatus } from "@prisma/client";

export type TodayBlocker = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
};

export type TodayCommandCenterPayload = {
  settings: Awaited<ReturnType<typeof prisma.kitchenSettings.findUnique>>;
  kpis: {
    ordersDueToday: number;
    ordersToday: number;
    activeOrders: number;
    productionAvgPct: number;
    openTasks: number;
    overdueTasks: number;
    routesToday: number;
    failedWebhooks: number;
    /** Unprocessed webhooks that record an error or failed signature validation. */
    webhooksNeedingAttention: number;
    errorIntegrations: number;
    failedExternalOrders: number;
    unmatchedExternalProducts: number;
    openSupportTickets: number;
    integrityIssueCount: number;
    revenueWeek: number;
    revenueToday: number;
    posTransactionsToday: number;
    posKitchenQueueToday: number;
    blockedOrdersApprox: number;
    packingQueueOpen: number;
    productionWorkOpen: number;
    confirmedOrders: number;
  };
  ordersDueToday: { id: string; customerName: string; status: string; pickupDate: Date | null }[];
  openTasks: { id: string; title: string; dueAt: Date | null; priority: string; status: string }[];
  routesToday: { id: string; status: string; totalStops: number }[];
  blockers: TodayBlocker[];
  readiness: ReturnType<typeof computeWorkspaceReadiness>;
  shortageReadiness: Awaited<ReturnType<typeof evaluateInventoryShortageReadiness>>;
};

export async function loadTodayCommandCenter(userId: string): Promise<TodayCommandCenterPayload> {
  const todayStart = startOfDay(new Date());
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const tomorrow = addDays(todayStart, 1);

  const [
    externalOrderWhere,
    externalProductWhere,
    orderWhere,
    productWhere,
    menuWhere,
    integrationWhere,
    kitchenTaskWhere,
    deliveryRouteWhere,
    supportTicketWhere,
    posTransactionWhere,
    staffMemberWhere,
  ] = await Promise.all([
    externalOrderListWhereForOwner(userId),
    externalProductListWhereForOwner(userId),
    orderListWhereForOwner(userId),
    productListWhereForOwner(userId),
    menuListWhereForOwner(userId),
    integrationConnectionListWhereForOwner(userId),
    kitchenTaskListWhereForOwner(userId),
    deliveryRouteListWhereForOwner(userId),
    supportTicketListWhereForOwner(userId),
    posTransactionListWhereForOwner(userId),
    staffMemberListWhereForOwner(userId),
  ]);

  const [
    settings,
    ordersToday,
    activeOrders,
    productionTasks,
    webhookSignals,
    errorIntegrations,
    revenueWeek,
    ordersDueToday,
    openTasks,
    overdueTasksCount,
    routesToday,
    failedExternalOrders,
    unmatchedExternalProducts,
    openSupportTickets,
    integrityIssueCount,
    ordersMissingPickup,
    deliveryUndispatched,
    posTransactionsToday,
    posKitchenQueueToday,
    revenueTodayAgg,
    todayOps,
  ] = await Promise.all([
    prisma.kitchenSettings.findUnique({ where: { userId } }),
    prisma.order.count({ where: { AND: [orderWhere, { createdAt: { gte: todayStart } }] } }),
    prisma.order.count({
      where: { AND: [orderWhere, { status: { notIn: ["COMPLETED", "CANCELLED"] } }] },
    }),
    prisma.productionTask.findMany({
      where: { product: productWhere },
      select: { cooked: true, packed: true, labeled: true },
    }),
    countWebhookQueueSignals(userId),
    prisma.integrationConnection.count({
      where: { AND: [integrationWhere, { status: IntegrationStatus.ERROR }] },
    }),
    prisma.order.aggregate({
      where: {
        AND: [
          orderWhere,
          {
            createdAt: { gte: weekStart },
            status: { in: ["CONFIRMED", "PREPARING", "READY", "COMPLETED"] },
          },
        ],
      },
      _sum: { total: true },
    }),
    loadOrdersDueTodayList(userId, todayStart, tomorrow),
    prisma.kitchenTask.findMany({
      where: {
        AND: [
          kitchenTaskWhere,
          { status: { in: ["OPEN", "IN_PROGRESS", "BLOCKED", "WAITING", "TODO"] } },
        ],
      },
      orderBy: [{ dueAt: "asc" }, { priority: "desc" }],
      take: 12,
      select: { id: true, title: true, dueAt: true, priority: true, status: true },
    }),
    prisma.kitchenTask.count({
      where: {
        AND: [
          kitchenTaskWhere,
          {
            status: { in: ["OPEN", "IN_PROGRESS", "BLOCKED", "WAITING", "TODO"] },
            dueAt: { lt: todayStart },
          },
        ],
      },
    }),
    prisma.deliveryRoute.findMany({
      where: { AND: [deliveryRouteWhere, { routeDate: { gte: todayStart, lt: tomorrow } }] },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, status: true, totalStops: true },
    }),
    prisma.externalOrder.count({
      where: { AND: [externalOrderWhere, { syncStatus: "FAILED" }] },
    }),
    prisma.externalProduct.count({
      where: { AND: [externalProductWhere, { mappedProductId: null }] },
    }),
    prisma.supportTicket.count({
      where: {
        AND: [
          supportTicketWhere,
          { status: { notIn: ["RESOLVED", "CLOSED", "CANCELLED", "DUPLICATE"] } },
        ],
      },
    }),
    countIntegrityIssues(userId),
    countOrdersMissingRequiredServiceDate(userId),
    countDeliveryOrdersWithoutRouteStops(userId),
    prisma.pOSTransaction.count({
      where: { AND: [posTransactionWhere, { createdAt: { gte: todayStart, lt: tomorrow } }] },
    }),
    prisma.order.count({
      where: {
        AND: [
          orderWhere,
          {
            creationSource: "POS",
            orderType: "POS_SALE",
            status: { in: ["CONFIRMED", "PREPARING"] },
            createdAt: { gte: todayStart, lt: tomorrow },
          },
        ],
      },
    }),
    prisma.order.aggregate({
      where: {
        AND: [
          orderWhere,
          {
            createdAt: { gte: todayStart, lt: tomorrow },
            status: { in: ["CONFIRMED", "PREPARING", "READY", "COMPLETED"] },
          },
        ],
      },
      _sum: { total: true },
    }),
    loadTodayOperationalCounts(userId),
  ]);

  const failedWebhooks = webhookSignals.unprocessedTotal;
  const webhooksNeedingAttention = webhookSignals.needingAttention;

  const productionAvgPct =
    productionTasks.length === 0
      ? 0
      : Math.round(
          (productionTasks.reduce(
            (acc, t) =>
              acc + (Number(t.cooked) + Number(t.packed) + Number(t.labeled)) / 3,
            0,
          ) /
            productionTasks.length) *
            100,
        );

  const blockers: TodayBlocker[] = [];
  if (unmatchedExternalProducts > 0) {
    blockers.push({
      id: "mapping",
      title: "Catalog mapping backlog",
      detail: `${unmatchedExternalProducts} incoming SKU row(s) are not linked to menu items.`,
      href: "/dashboard/product-mapping",
      priority: 10,
    });
  }
  if (failedExternalOrders > 0) {
    blockers.push({
      id: "ext-orders",
      title: "Failed channel orders",
      detail: `${failedExternalOrders} external order row(s) need attention.`,
      href: "/dashboard/order-hub",
      priority: 8,
    });
  }
  if (errorIntegrations > 0) {
    blockers.push({
      id: "integrations",
      title: "Integration errors",
      detail: `${errorIntegrations} connection(s) reported an error state.`,
      href: "/dashboard/sales-channels/health",
      priority: 12,
    });
  }
  if (webhooksNeedingAttention > 0) {
    blockers.push({
      id: "webhooks-issues",
      title: "Webhook processing issues",
      detail: `${webhooksNeedingAttention} unprocessed event(s) have an error or invalid signature — review before retry.`,
      href: "/dashboard/sales-channels/webhooks",
      priority: 9,
    });
  } else if (failedWebhooks > 0) {
    blockers.push({
      id: "webhooks",
      title: "Webhook backlog",
      detail: `${failedWebhooks} event(s) await processing (no recorded errors yet).`,
      href: "/dashboard/sales-channels/webhooks",
      priority: 11,
    });
  }
  if (ordersMissingPickup > 0) {
    blockers.push({
      id: "pickup",
      title: "Orders missing required service / pickup date",
      detail: `${ordersMissingPickup} active order(s) need a scheduled date for their fulfillment profile.`,
      href: "/dashboard/order-hub?tab=missing_fulfillment_info",
      priority: 14,
    });
  }
  if (deliveryUndispatched > 0) {
    blockers.push({
      id: "dispatch",
      title: "Delivery without route stops",
      detail: `${deliveryUndispatched} in-flight delivery order(s) have no route stops assigned yet.`,
      href: "/dashboard/routes",
      priority: 13,
    });
  }
  if (integrityIssueCount > 0) {
    blockers.push({
      id: "integrity",
      title: "Data integrity flags",
      detail: `${integrityIssueCount} consistency check(s) need review.`,
      href: "/dashboard/system-health/data-integrity",
      priority: 20,
    });
  }
  blockers.sort((a, b) => a.priority - b.priority);

  const readiness = computeWorkspaceReadiness({
    settings,
    menuCount: await prisma.menu.count({ where: menuWhere }),
    productCount: await prisma.product.count({ where: productWhere }),
    channelCount: await prisma.orderChannel.count({
      where: { AND: [await orderChannelListWhereForOwner(userId), { active: true }] },
    }),
    integrationConnectedCount: await prisma.integrationConnection.count({
      where: { AND: [integrationWhere, { status: IntegrationStatus.CONNECTED }] },
    }),
    staffCount: await prisma.staffMember.count({
      where: { AND: [staffMemberWhere, { active: true }] },
    }),
    activeOrders,
  });

  const shortageReadiness = await evaluateInventoryShortageReadiness(userId);

  return {
    settings,
    kpis: {
      ordersDueToday: ordersDueToday.length,
      ordersToday,
      activeOrders,
      productionAvgPct: productionAvgPct,
      openTasks: openTasks.length,
      overdueTasks: overdueTasksCount,
      routesToday: routesToday.length,
      failedWebhooks,
      webhooksNeedingAttention,
      errorIntegrations,
      failedExternalOrders,
      unmatchedExternalProducts,
      openSupportTickets,
      integrityIssueCount,
      revenueWeek: Number(revenueWeek._sum.total ?? 0),
      revenueToday: Number(revenueTodayAgg._sum.total ?? 0),
      posTransactionsToday,
      posKitchenQueueToday,
      blockedOrdersApprox: todayOps.blockedOrdersApprox,
      packingQueueOpen: todayOps.packingQueueOpen,
      productionWorkOpen: todayOps.productionWorkOpen,
      confirmedOrders: todayOps.confirmedOrdersToday,
    },
    ordersDueToday,
    openTasks,
    routesToday,
    blockers,
    readiness,
    shortageReadiness,
  };
}

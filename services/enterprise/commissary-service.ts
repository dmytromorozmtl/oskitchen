import type { PurchaseOrderStatus } from "@prisma/client";

import { buildEnterpriseCommissaryDashboard } from "@/lib/enterprise/commissary-builders";
import type { CommissaryProductionTask, CommissaryTransferSummary } from "@/lib/enterprise/commissary-types";
import { normalizeProductionPlanTaskStatus } from "@/lib/production/production-plan-task-status";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  purchaseOrderListWhereForOwner,
  reorderQueueItemListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { listTransfers } from "@/services/commissary/transfer-service";
import { getProductionCalendar } from "@/services/production/production-calendar-service";
import { loadRouteOverviewKpis } from "@/services/routes/route-overview";
import { weekStartMonday } from "@/services/labor/schedule-service";

export type {
  CommissaryAlert,
  CommissaryPillarSnapshot,
  EnterpriseCommissaryDashboard,
} from "@/lib/enterprise/commissary-types";

const OPEN_PO_STATUSES: PurchaseOrderStatus[] = ["DRAFT", "AWAITING_APPROVAL", "SENT", "PARTIALLY_RECEIVED"];

export async function loadEnterpriseCommissaryDashboard(workspaceId: string) {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const weekStart = weekStartMonday();
  const [productionTasks, transfers, routeKpis, locationCount, purchaseOrderScope, reorderScope] =
    await Promise.all([
      getProductionCalendar(ownerUserId, weekStart),
      listTransfers(ownerUserId),
      loadRouteOverviewKpis(ownerUserId),
      prisma.location.count({ where: { userId: ownerUserId } }),
      purchaseOrderListWhereForOwner(ownerUserId),
      reorderQueueItemListWhereForOwner(ownerUserId),
    ]);

  const [poGroups, overduePoCount, reorderQueueOpen] = await Promise.all([
    prisma.purchaseOrder.groupBy({
      by: ["status"],
      where: purchaseOrderScope,
      _count: { _all: true },
    }),
    prisma.purchaseOrder.count({
      where: {
        AND: [
          purchaseOrderScope,
          { status: { in: ["SENT", "PARTIALLY_RECEIVED"] } },
          { requestedDeliveryDate: { lt: new Date() } },
        ],
      },
    }),
    prisma.reorderQueueItem.count({ where: { AND: [reorderScope, { status: "OPEN" }] } }),
  ]);

  const poByStatus = Object.fromEntries(poGroups.map((row) => [row.status, row._count._all])) as Partial<
    Record<PurchaseOrderStatus, number>
  >;

  const openPurchaseOrders = OPEN_PO_STATUSES.reduce((sum, status) => sum + (poByStatus[status] ?? 0), 0);

  const productionTasksThisWeek: CommissaryProductionTask[] = productionTasks.map((task) => ({
    id: task.id,
    title: task.title,
    planDateIso: task.planDate.toISOString().slice(0, 10),
    status: normalizeProductionPlanTaskStatus(task.status),
    batchSize: task.batchSize,
  }));

  const recentTransfers: CommissaryTransferSummary[] = transfers.slice(0, 8).map((transfer) => ({
    id: transfer.id,
    status: transfer.status,
    lineCount: transfer.lines.length,
    createdAtIso: transfer.createdAt.toISOString(),
  }));

  const pendingTransfers = transfers.filter((row) => row.status === "PENDING").length;

  return buildEnterpriseCommissaryDashboard({
    workspaceId,
    weekStartIso: weekStart.toISOString().slice(0, 10),
    locationCount,
    productionTasksThisWeek,
    pendingTransfers,
    recentTransfers,
    openPurchaseOrders,
    draftPurchaseOrders: poByStatus.DRAFT ?? 0,
    overduePurchaseOrders: overduePoCount,
    reorderQueueOpen,
    routeKpis,
  });
}

export async function loadEnterpriseCommissaryDashboardForUser(userId: string) {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) {
    throw new Error(`No workspace for user: ${userId}`);
  }
  return loadEnterpriseCommissaryDashboard(workspaceId);
}

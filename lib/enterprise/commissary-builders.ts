import {
  ENTERPRISE_COMMISSARY_PATH,
  ENTERPRISE_COMMISSARY_POLICY_ID,
} from "@/lib/enterprise/commissary-policy";
import type {
  CommissaryAlert,
  CommissaryPillarSnapshot,
  CommissaryPillarStatus,
  CommissaryProductionTask,
  CommissaryTransferSummary,
  EnterpriseCommissaryDashboard,
} from "@/lib/enterprise/commissary-types";
import type { RouteOverviewKpis } from "@/services/routes/route-overview";

export type CommissaryRawInput = {
  workspaceId: string;
  weekStartIso: string;
  locationCount: number;
  productionTasksThisWeek: CommissaryProductionTask[];
  pendingTransfers: number;
  recentTransfers: CommissaryTransferSummary[];
  openPurchaseOrders: number;
  draftPurchaseOrders: number;
  overduePurchaseOrders: number;
  reorderQueueOpen: number;
  routeKpis: RouteOverviewKpis;
  analyzedAt?: Date;
};

function pillarStatus(score: number): CommissaryPillarStatus {
  if (score >= 2) return "critical";
  if (score >= 1) return "watch";
  if (score <= -1) return "idle";
  return "healthy";
}

export function buildProductionPillar(tasks: CommissaryProductionTask[]): CommissaryPillarSnapshot {
  const scheduled = tasks.filter((row) => row.status !== "COMPLETED").length;
  const inProgress = tasks.filter((row) => row.status === "IN_PROGRESS").length;
  const score = scheduled >= 8 ? 1 : tasks.length === 0 ? -1 : 0;

  return {
    pillar: "production",
    label: "Production",
    status: pillarStatus(score),
    headline: tasks.length > 0 ? `${scheduled} batch task${scheduled === 1 ? "" : "s"} this week` : "No production plan this week",
    metrics: [
      { label: "Tasks", value: tasks.length },
      { label: "In progress", value: inProgress },
      { label: "Scheduled", value: scheduled },
    ],
    recommendation:
      tasks.length === 0
        ? "Add batch tasks on the production calendar before commissary prep week."
        : inProgress > 0
          ? "Monitor in-progress batches — align KDS and packing with commissary output."
          : "Review scheduled batches and prep pars for hub fulfillment.",
    href: "/dashboard/production/calendar",
  };
}

export function buildPurchasingPillar(input: {
  openPurchaseOrders: number;
  draftPurchaseOrders: number;
  overduePurchaseOrders: number;
  reorderQueueOpen: number;
}): CommissaryPillarSnapshot {
  const score =
    input.overduePurchaseOrders > 0 ? 2 : input.reorderQueueOpen >= 5 ? 1 : input.openPurchaseOrders === 0 ? -1 : 0;

  return {
    pillar: "purchasing",
    label: "Purchasing",
    status: pillarStatus(score),
    headline:
      input.openPurchaseOrders > 0
        ? `${input.openPurchaseOrders} open PO${input.openPurchaseOrders === 1 ? "" : "s"} for commissary supply`
        : "No open purchase orders",
    metrics: [
      { label: "Open POs", value: input.openPurchaseOrders },
      { label: "Draft", value: input.draftPurchaseOrders },
      { label: "Reorder queue", value: input.reorderQueueOpen },
    ],
    recommendation:
      input.overduePurchaseOrders > 0
        ? `${input.overduePurchaseOrders} overdue PO${input.overduePurchaseOrders === 1 ? "" : "s"} — chase suppliers before production gaps.`
        : input.reorderQueueOpen > 0
          ? "Convert reorder queue items to POs for hub ingredients."
          : "Purchasing clear — maintain safety stock for distribution lanes.",
    href: "/dashboard/purchasing",
  };
}

export function buildDeliveryPillar(kpis: RouteOverviewKpis): CommissaryPillarSnapshot {
  const score =
    kpis.routesNeedingAttention > 0 || kpis.failedStops > 0
      ? 2
      : kpis.stopsNotPacked > 3
        ? 1
        : kpis.routesPlanned === 0
          ? -1
          : 0;

  return {
    pillar: "delivery",
    label: "Delivery",
    status: pillarStatus(score),
    headline:
      kpis.routesPlanned > 0
        ? `${kpis.routesPlanned} route${kpis.routesPlanned === 1 ? "" : "s"} planned today`
        : "No delivery routes scheduled today",
    metrics: [
      { label: "Routes", value: kpis.routesPlanned },
      { label: "Stops ready", value: kpis.stopsReady },
      { label: "Not packed", value: kpis.stopsNotPacked },
    ],
    recommendation:
      kpis.failedStops > 0
        ? `${kpis.failedStops} failed stop${kpis.failedStops === 1 ? "" : "s"} — reschedule commissary outbound runs.`
        : kpis.stopsNotPacked > 0
          ? "Pack commissary outbound stops before route departure windows."
          : "Delivery lanes on track — confirm driver assignments for hub dispatch.",
    href: "/dashboard/routes",
  };
}

export function buildDistributionPillar(input: {
  pendingTransfers: number;
  recentTransfers: CommissaryTransferSummary[];
  locationCount: number;
}): CommissaryPillarSnapshot {
  const score =
    input.pendingTransfers >= 5 ? 1 : input.locationCount < 2 ? -1 : input.pendingTransfers > 0 ? 0 : -1;

  return {
    pillar: "distribution",
    label: "Distribution",
    status: pillarStatus(score),
    headline:
      input.pendingTransfers > 0
        ? `${input.pendingTransfers} transfer${input.pendingTransfers === 1 ? "" : "s"} awaiting receipt`
        : "No pending inter-location transfers",
    metrics: [
      { label: "Pending", value: input.pendingTransfers },
      { label: "Recent", value: input.recentTransfers.length },
      { label: "Locations", value: input.locationCount },
    ],
    recommendation:
      input.locationCount < 2
        ? "Add a second location to enable commissary hub → store distribution."
        : input.pendingTransfers > 0
          ? "Receive pending transfers to update store-level inventory."
          : "Distribution clear — schedule next hub-to-store replenishment.",
    href: "/dashboard/commissary/transfers",
  };
}

export function buildCommissaryAlerts(pillars: CommissaryPillarSnapshot[]): CommissaryAlert[] {
  const alerts: CommissaryAlert[] = [];

  for (const pillar of pillars) {
    if (pillar.status === "critical") {
      alerts.push({
        id: `${pillar.pillar}-critical`,
        pillar: pillar.pillar,
        severity: "warning",
        message: `${pillar.label}: ${pillar.recommendation}`,
      });
    } else if (pillar.status === "idle") {
      alerts.push({
        id: `${pillar.pillar}-idle`,
        pillar: pillar.pillar,
        severity: "info",
        message: `${pillar.label}: ${pillar.recommendation}`,
      });
    }
  }

  return alerts;
}

export function buildEnterpriseCommissaryDashboard(input: CommissaryRawInput): EnterpriseCommissaryDashboard {
  const analyzedAt = input.analyzedAt ?? new Date();
  const pillars = [
    buildProductionPillar(input.productionTasksThisWeek),
    buildPurchasingPillar(input),
    buildDeliveryPillar(input.routeKpis),
    buildDistributionPillar(input),
  ];

  return {
    policyId: ENTERPRISE_COMMISSARY_POLICY_ID,
    workspaceId: input.workspaceId,
    generatedAtIso: analyzedAt.toISOString(),
    weekStartIso: input.weekStartIso,
    pillars,
    recentTransfers: input.recentTransfers,
    upcomingProduction: input.productionTasksThisWeek.filter((row) => row.status !== "COMPLETED").slice(0, 8),
    alerts: buildCommissaryAlerts(pillars),
    summary: {
      locationCount: input.locationCount,
      pendingTransfers: input.pendingTransfers,
      openPurchaseOrders: input.openPurchaseOrders,
      reorderQueueOpen: input.reorderQueueOpen,
      productionTasksThisWeek: input.productionTasksThisWeek.length,
      routesPlannedToday: input.routeKpis.routesPlanned,
      stopsNotPacked: input.routeKpis.stopsNotPacked,
    },
    basePath: ENTERPRISE_COMMISSARY_PATH,
  };
}

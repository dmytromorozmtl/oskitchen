import type {
  OwnerDailyBriefingNextAction,
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
} from "@/lib/briefing/owner-daily-briefing-era19";
import { ratePercentLabel } from "@/lib/analytics/operational-metrics";
import {
  DRIVER_ROLE_UI_HEADLINE,
  DRIVER_ROLE_UI_LABEL,
  DRIVER_ROLE_UI_PATH,
  DRIVER_ROLE_UI_POLICY_ID,
} from "@/lib/roles/driver-ui-policy";
import type {
  DriverRoleKpi,
  DriverRoleShortcut,
  DriverRoleUiSnapshot,
} from "@/lib/roles/driver-ui-types";
import type { RouteOverviewKpis } from "@/services/routes/route-overview";

export const DRIVER_ROLE_SHORTCUTS: DriverRoleShortcut[] = [
  {
    id: "driver-routes",
    label: "Today's route",
    description: "Assigned stops and delivery progress.",
    href: "/dashboard/routes/driver",
  },
  {
    id: "all-routes",
    label: "All routes",
    description: "Dispatch board and route status.",
    href: "/dashboard/routes",
  },
  {
    id: "planner",
    label: "Route planner",
    description: "Plan manifests and stop sequencing.",
    href: "/dashboard/routes/planner",
  },
  {
    id: "fleet",
    label: "Fleet map",
    description: "Live fleet and stop map view.",
    href: "/dashboard/routes/fleet",
  },
  {
    id: "packing",
    label: "Packing",
    description: "Fulfillment checklist before load-out.",
    href: "/dashboard/packing",
  },
  {
    id: "delivery-analytics",
    label: "Delivery analytics",
    description: "On-time rate and stop completion.",
    href: "/dashboard/analytics/delivery",
  },
  {
    id: "driver-entry",
    label: "Driver mode",
    description: "Mobile-first driver entry screen.",
    href: "/driver",
  },
  {
    id: "today",
    label: "Today",
    description: "Operational blockers and dispatch alerts.",
    href: "/dashboard/today",
  },
];

export function buildDriverRoleKpi(input: {
  id: string;
  label: string;
  value: string;
  hint?: string | null;
  href?: string | null;
}): DriverRoleKpi {
  return {
    id: input.id,
    label: input.label,
    value: input.value,
    hint: input.hint ?? null,
    href: input.href ?? null,
  };
}

export function buildDriverRoleKpis(input: {
  routeKpis: RouteOverviewKpis;
  onTimeRate: number | null;
}): DriverRoleKpi[] {
  return [
    buildDriverRoleKpi({
      id: "routes-planned",
      label: "Routes planned today",
      value: String(input.routeKpis.routesPlanned),
      href: "/dashboard/routes",
    }),
    buildDriverRoleKpi({
      id: "completed-stops",
      label: "Completed stops",
      value: String(input.routeKpis.completedStops),
      hint: `${input.routeKpis.outForDelivery} out for delivery`,
      href: "/dashboard/routes/driver",
    }),
    buildDriverRoleKpi({
      id: "stops-ready",
      label: "Stops ready",
      value: String(input.routeKpis.stopsReady),
      hint: `${input.routeKpis.stopsNotPacked} awaiting pack`,
      href: "/dashboard/packing",
    }),
    buildDriverRoleKpi({
      id: "on-time-rate",
      label: "On-time rate (30d)",
      value: ratePercentLabel(input.onTimeRate),
      href: "/dashboard/analytics/delivery",
    }),
  ];
}

function buildDriverHeroTiles(routeKpis: RouteOverviewKpis): OwnerDailyBriefingTile[] {
  const tiles: OwnerDailyBriefingTile[] = [
    {
      id: "delivery-orders-today",
      category: "orders",
      label: "Delivery orders today",
      value: String(routeKpis.deliveryOrdersToday),
      detail: "Active delivery fulfillment window",
      whyItMatters: "Volume drives route load",
      href: "/dashboard/orders",
      availability: "available",
      linkState: routeKpis.deliveryOrdersToday > 0 ? "operational" : "empty",
      tone: routeKpis.deliveryOrdersToday > 0 ? "neutral" : "attention",
      priority: 1,
    },
    {
      id: "out-for-delivery",
      category: "packing",
      label: "Out for delivery",
      value: String(routeKpis.outForDelivery),
      detail: "Stops currently en route",
      whyItMatters: "Driver workload signal",
      href: "/dashboard/routes/driver",
      availability: "available",
      linkState: "operational",
      tone: routeKpis.outForDelivery > 0 ? "success" : "neutral",
      priority: 2,
    },
    {
      id: "failed-stops",
      category: "orders",
      label: "Failed stops",
      value: String(routeKpis.failedStops),
      detail: "Needs manager follow-up",
      whyItMatters: "Customer recovery",
      href: "/dashboard/routes",
      availability: "available",
      linkState: routeKpis.failedStops > 0 ? "blocked" : "operational",
      tone: routeKpis.failedStops > 0 ? "attention" : "neutral",
      priority: 3,
    },
    {
      id: "routes-attention",
      category: "packing",
      label: "Routes needing attention",
      value: String(routeKpis.routesNeedingAttention),
      detail: "Partial or failed route status",
      whyItMatters: "Dispatch escalation",
      href: "/dashboard/routes",
      availability: "available",
      linkState: routeKpis.routesNeedingAttention > 0 ? "blocked" : "ready",
      tone: routeKpis.routesNeedingAttention > 0 ? "attention" : "success",
      priority: 4,
    },
  ];
  return tiles;
}

function buildDriverNextAction(routeKpis: RouteOverviewKpis): OwnerDailyBriefingNextAction {
  if (routeKpis.stopsNotPacked > 0) {
    return {
      id: "packing-handoff",
      title: "Complete packing handoff",
      detail: `${routeKpis.stopsNotPacked} stop(s) still awaiting pack confirmation.`,
      href: "/dashboard/packing",
      ctaLabel: "Open packing",
      tone: "urgent",
    };
  }
  if (routeKpis.outForDelivery > 0) {
    return {
      id: "deliver-stops",
      title: "Deliver active stops",
      detail: `${routeKpis.outForDelivery} stop(s) are out for delivery.`,
      href: "/dashboard/routes/driver",
      ctaLabel: "Open route",
      tone: "normal",
    };
  }
  if (routeKpis.routesPlanned === 0) {
    return {
      id: "await-route",
      title: "Await route assignment",
      detail: "No routes planned for today — check with dispatch.",
      href: "/dashboard/routes",
      ctaLabel: "View routes",
      tone: "normal",
    };
  }
  return {
    id: "review-manifest",
    title: "Review today's manifest",
    detail: `${routeKpis.routesPlanned} route(s) planned with ${routeKpis.stopsReady} stops ready.`,
    href: "/dashboard/routes/driver",
    ctaLabel: "Start route",
    tone: "success",
  };
}

function buildDriverTopActions(routeKpis: RouteOverviewKpis): OwnerDailyBriefingRankedAction[] {
  const actions: OwnerDailyBriefingRankedAction[] = [];

  if (routeKpis.stopsNotPacked > 0) {
    actions.push({
      id: "action-pack-stops",
      title: "Pack pending stops",
      reason: `${routeKpis.stopsNotPacked} stops not packed`,
      severity: "high",
      ownerRole: "manager",
      href: "/dashboard/packing",
      status: "open",
      unblockCondition: "All stops marked packed",
      priority: 1,
      ctaLabel: "Packing",
      tone: "urgent",
    });
  }
  if (routeKpis.outForDelivery > 0) {
    actions.push({
      id: "action-deliver",
      title: "Complete deliveries",
      reason: `${routeKpis.outForDelivery} stops en route`,
      severity: "normal",
      ownerRole: "manager",
      href: "/dashboard/routes/driver",
      status: "open",
      unblockCondition: "Mark stops delivered",
      priority: 2,
      ctaLabel: "Driver view",
      tone: "normal",
    });
  }
  if (routeKpis.failedStops > 0) {
    actions.push({
      id: "action-failed",
      title: "Resolve failed stops",
      reason: `${routeKpis.failedStops} failed deliveries`,
      severity: "critical",
      ownerRole: "manager",
      href: "/dashboard/routes",
      status: "open",
      unblockCondition: "Failed stops retried or cancelled",
      priority: 0,
      ctaLabel: "Routes",
      tone: "urgent",
    });
  }
  if (routeKpis.routesNeedingAttention > 0) {
    actions.push({
      id: "action-route-attention",
      title: "Review flagged routes",
      reason: `${routeKpis.routesNeedingAttention} routes need attention`,
      severity: "high",
      ownerRole: "manager",
      href: "/dashboard/routes",
      status: "monitor",
      unblockCondition: "Route status cleared",
      priority: 3,
      ctaLabel: "Dispatch",
      tone: "normal",
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "action-ready",
      title: "Routes on track",
      reason: "No delivery blockers detected",
      severity: "low",
      ownerRole: "manager",
      href: "/dashboard/routes/driver",
      status: "ready",
      unblockCondition: "Continue monitoring",
      priority: 10,
      ctaLabel: "Today's route",
      tone: "success",
    });
  }

  return actions.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

export function buildDriverRoleUiSnapshot(input: {
  workspaceLabel: string;
  routeKpis: RouteOverviewKpis;
  onTimeRate: number | null;
  analyzedAt?: Date;
}): DriverRoleUiSnapshot {
  const heroTiles = buildDriverHeroTiles(input.routeKpis);
  const attentionTileCount = heroTiles.filter((tile) => tile.tone === "attention").length;

  return {
    policyId: DRIVER_ROLE_UI_POLICY_ID,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    workspaceLabel: input.workspaceLabel,
    rolePackLabel: DRIVER_ROLE_UI_LABEL,
    rolePackHeadline: DRIVER_ROLE_UI_HEADLINE,
    kpis: buildDriverRoleKpis({
      routeKpis: input.routeKpis,
      onTimeRate: input.onTimeRate,
    }),
    shortcuts: DRIVER_ROLE_SHORTCUTS,
    heroTiles,
    topActions: buildDriverTopActions(input.routeKpis),
    nextAction: buildDriverNextAction(input.routeKpis),
    summary: {
      attentionTileCount,
      alertCount: input.routeKpis.failedStops + input.routeKpis.routesNeedingAttention,
      readinessOverall:
        input.routeKpis.failedStops > 0 || input.routeKpis.stopsNotPacked > 0
          ? 65
          : input.routeKpis.outForDelivery > 0
            ? 85
            : 95,
      shortcutCount: DRIVER_ROLE_SHORTCUTS.length,
    },
    basePath: DRIVER_ROLE_UI_PATH,
  };
}

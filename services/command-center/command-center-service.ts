import { defaultFilters } from "@/lib/analytics/filters";
import {
  buildCommandCenterAlertsFromBlockers,
  buildCommandCenterLane,
  buildCommandCenterSnapshot,
  buildCommandCenterTicker,
  formatMoney,
  formatRate,
} from "@/lib/command-center/command-center-builders";
import type { CommandCenterSnapshot } from "@/lib/command-center/command-center-types";
import { prisma } from "@/lib/prisma";
import { loadExecutiveOverview } from "@/services/analytics/analytics-service";
import { loadForecasting2Snapshot } from "@/services/ai/forecasting";
import { loadRouteOverviewKpis } from "@/services/routes/route-overview";
import { loadTodayCommandCenter } from "@/services/today/today-command-center-service";

export type { CommandCenterSnapshot } from "@/lib/command-center/command-center-types";

export async function loadCommandCenterSnapshot(userId: string): Promise<CommandCenterSnapshot> {
  const filters = defaultFilters();
  const scope = { userId };

  const [executive, today, routes, forecast, workspace, profile] = await Promise.all([
    loadExecutiveOverview(scope, filters),
    loadTodayCommandCenter(userId),
    loadRouteOverviewKpis(userId),
    loadForecasting2Snapshot(userId),
    prisma.workspace.findFirst({
      where: { ownerUserId: userId },
      select: { name: true },
    }),
    prisma.userProfile.findUnique({
      where: { id: userId },
      select: { companyName: true },
    }),
  ]);

  const lanes = [
    buildCommandCenterLane({
      id: "market",
      tickers: [
        buildCommandCenterTicker({
          id: "rev-gross",
          symbol: "REV",
          label: "Gross revenue (30d)",
          value: formatMoney(executive.grossRevenue),
          hint: `Net ${formatMoney(executive.netRevenue)}`,
          href: "/dashboard/analytics/revenue",
          tone: executive.grossRevenue > 0 ? "positive" : "neutral",
        }),
        buildCommandCenterTicker({
          id: "ord-30d",
          symbol: "ORD",
          label: "Orders (30d)",
          value: String(executive.orderCount),
          href: "/dashboard/analytics/orders",
        }),
        buildCommandCenterTicker({
          id: "aov",
          symbol: "AOV",
          label: "Average order",
          value: executive.aov != null ? formatMoney(executive.aov) : "—",
          href: "/dashboard/analytics/revenue",
        }),
        buildCommandCenterTicker({
          id: "chn-top",
          symbol: "CHN",
          label: "Top channel",
          value: executive.topChannel?.label ?? "—",
          hint: executive.topChannel ? formatMoney(executive.topChannel.revenue) : null,
          href: "/dashboard/analytics/channels",
        }),
      ],
    }),
    buildCommandCenterLane({
      id: "operations",
      tickers: [
        buildCommandCenterTicker({
          id: "prd",
          symbol: "PRD",
          label: "Production",
          value: formatRate(executive.productionCompletionRate),
          href: "/dashboard/kitchen/production",
          tone:
            executive.productionCompletionRate != null && executive.productionCompletionRate < 0.8
              ? "warning"
              : "neutral",
        }),
        buildCommandCenterTicker({
          id: "pkg",
          symbol: "PKG",
          label: "Packing",
          value: formatRate(executive.packingCompletionRate),
          href: "/dashboard/analytics/delivery",
        }),
        buildCommandCenterTicker({
          id: "dlv",
          symbol: "DLV",
          label: "Delivery",
          value: formatRate(executive.deliveryCompletionRate),
          href: "/dashboard/analytics/delivery",
        }),
        buildCommandCenterTicker({
          id: "kds",
          symbol: "KDS",
          label: "Kitchen queue",
          value: String(today.kpis.posKitchenQueueToday),
          href: "/dashboard/kitchen",
          tone: today.kpis.posKitchenQueueToday > 10 ? "warning" : "neutral",
        }),
      ],
    }),
    buildCommandCenterLane({
      id: "live",
      tickers: [
        buildCommandCenterTicker({
          id: "rev-today",
          symbol: "RTD",
          label: "Revenue today",
          value: formatMoney(today.kpis.revenueToday),
          href: "/dashboard/today",
          tone: today.kpis.revenueToday > 0 ? "positive" : "neutral",
        }),
        buildCommandCenterTicker({
          id: "ord-today",
          symbol: "OTD",
          label: "Orders today",
          value: String(today.kpis.ordersToday),
          href: "/dashboard/orders",
        }),
        buildCommandCenterTicker({
          id: "active",
          symbol: "ACT",
          label: "Active orders",
          value: String(today.kpis.activeOrders),
          href: "/dashboard/order-hub",
        }),
        buildCommandCenterTicker({
          id: "routes",
          symbol: "RTE",
          label: "Routes planned",
          value: String(routes.routesPlanned),
          hint: `${routes.completedStops} stops done`,
          href: "/dashboard/routes",
        }),
      ],
    }),
    buildCommandCenterLane({
      id: "forecast",
      tickers: [
        buildCommandCenterTicker({
          id: "fcst-ord",
          symbol: "F90",
          label: "90d orders (est.)",
          value: String(forecast.summary.projectedTotalOrders),
          hint: `${forecast.summary.confidence} confidence`,
          href: "/dashboard/forecast/forecasting-2",
        }),
        buildCommandCenterTicker({
          id: "fcst-rev",
          symbol: "F$",
          label: "90d revenue (est.)",
          value: formatMoney(forecast.summary.projectedTotalRevenueUsd),
          href: "/dashboard/forecast/forecasting-2",
        }),
        buildCommandCenterTicker({
          id: "fcst-hol",
          symbol: "HOL",
          label: "Holiday uplift days",
          value: String(forecast.summary.holidayUpliftDays),
          href: "/dashboard/forecast/forecasting-2",
        }),
        buildCommandCenterTicker({
          id: "suite",
          symbol: "SUITE",
          label: "Analytics suite",
          value: "OPEN",
          href: "/dashboard/analytics/suite",
          tone: "positive",
        }),
      ],
    }),
    buildCommandCenterLane({
      id: "roles",
      tickers: [
        buildCommandCenterTicker({
          id: "role-owner",
          symbol: "OWN",
          label: "Owner UI",
          value: "→",
          href: "/dashboard/roles/owner",
        }),
        buildCommandCenterTicker({
          id: "role-mgr",
          symbol: "MGR",
          label: "Manager UI",
          value: "→",
          href: "/dashboard/roles/manager",
        }),
        buildCommandCenterTicker({
          id: "role-chef",
          symbol: "CHF",
          label: "Chef UI",
          value: "→",
          href: "/dashboard/roles/chef",
        }),
        buildCommandCenterTicker({
          id: "role-csr",
          symbol: "CSR",
          label: "Cashier UI",
          value: "→",
          href: "/dashboard/roles/cashier",
        }),
        buildCommandCenterTicker({
          id: "role-drv",
          symbol: "DRV",
          label: "Driver UI",
          value: "→",
          href: "/dashboard/roles/driver",
        }),
      ],
    }),
  ];

  const alerts = [
    ...buildCommandCenterAlertsFromBlockers(today.blockers),
    ...executive.warnings.slice(0, 3).map((warning, index) => ({
      id: `exec-warning-${index}`,
      title: "Analytics warning",
      detail: warning,
      href: "/dashboard/analytics",
      severity: "warning" as const,
    })),
    ...(forecast.summary.warning
      ? [
          {
            id: "forecast-warning",
            title: "Forecast note",
            detail: forecast.summary.warning,
            href: "/dashboard/forecast/forecasting-2",
            severity: "info" as const,
          },
        ]
      : []),
  ];

  return buildCommandCenterSnapshot({
    workspaceLabel: workspace?.name ?? profile?.companyName ?? "Workspace",
    rangeLabel: executive.filtersRangeLabel,
    lanes,
    alerts,
    blockerCount: today.blockers.length,
  });
}

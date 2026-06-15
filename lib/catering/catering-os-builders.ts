import {
  CATERING_OS_PATH,
  CATERING_OS_POLICY_ID,
} from "@/lib/catering/catering-os-policy";
import type {
  CateringClientRow,
  CateringEventRow,
  CateringOsAlert,
  CateringOsDashboard,
  CateringOsModuleSnapshot,
  CateringOsModuleStatus,
} from "@/lib/catering/catering-os-types";
import type { RouteOverviewKpis } from "@/services/routes/route-overview";

export type CateringOsRawInput = {
  workspaceId: string;
  openQuotes: number;
  acceptedQuotes: number;
  pipelineValue: number;
  followUpsDue: number;
  upcomingEvents: CateringEventRow[];
  topClients: CateringClientRow[];
  packingTasksToday: number;
  packingWavesToday: number;
  packingPending: number;
  routeKpis: RouteOverviewKpis;
  deliveryEvents: number;
  analyzedAt?: Date;
};

function moduleStatus(score: number): CateringOsModuleStatus {
  if (score >= 2) return "critical";
  if (score >= 1) return "watch";
  if (score <= -1) return "idle";
  return "healthy";
}

export function buildEventsModule(events: CateringEventRow[], openQuotes: number): CateringOsModuleSnapshot {
  const next7 = events.filter((row) => {
    const days = (new Date(row.eventDateIso).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    return days >= 0 && days <= 7;
  }).length;
  const score = next7 >= 5 ? 1 : events.length === 0 && openQuotes > 0 ? 1 : events.length === 0 ? -1 : 0;

  return {
    module: "events",
    label: "Events",
    status: moduleStatus(score),
    headline:
      events.length > 0
        ? `${events.length} event${events.length === 1 ? "" : "s"} in the next 30 days`
        : "No scheduled events on the calendar",
    metrics: [
      { label: "Upcoming", value: events.length },
      { label: "Next 7d", value: next7 },
      { label: "Delivery", value: events.filter((row) => row.deliveryRequired).length },
    ],
    recommendation:
      events.length === 0
        ? "Add event dates to open quotes to unlock production and packing timelines."
        : next7 > 0
          ? `${next7} event${next7 === 1 ? "" : "s"} this week — confirm menus and staffing.`
          : "Review event pipeline and convert accepted quotes to orders.",
    href: "/dashboard/catering-quotes/pipeline",
  };
}

export function buildClientsModule(clients: CateringClientRow[], openQuotes: number): CateringOsModuleSnapshot {
  const repeatClients = clients.filter((row) => row.quoteCount >= 2).length;
  const score = openQuotes > 0 && clients.length === 0 ? 1 : clients.length === 0 ? -1 : 0;

  return {
    module: "clients",
    label: "Clients",
    status: moduleStatus(score),
    headline:
      clients.length > 0
        ? `${clients.length} active B2B client${clients.length === 1 ? "" : "s"}`
        : "No catering clients in pipeline",
    metrics: [
      { label: "Clients", value: clients.length },
      { label: "Repeat", value: repeatClients },
      { label: "Top pipeline", value: clients[0] ? `$${clients[0].pipelineValue.toFixed(0)}` : "$0" },
    ],
    recommendation:
      clients.length === 0
        ? "Capture company names on quotes to build a catering CRM book."
        : repeatClients > 0
          ? "Nurture repeat clients — schedule follow-ups before event season peaks."
          : "Link quotes to CRM customers for lifecycle automation.",
    href: "/dashboard/customers",
  };
}

export function buildPackingModule(input: {
  packingTasksToday: number;
  packingWavesToday: number;
  packingPending: number;
  upcomingEvents: number;
}): CateringOsModuleSnapshot {
  const score =
    input.packingPending >= 10 ? 2 : input.packingPending >= 3 ? 1 : input.upcomingEvents > 0 && input.packingTasksToday === 0 ? 1 : input.packingTasksToday === 0 ? -1 : 0;

  return {
    module: "packing",
    label: "Packing",
    status: moduleStatus(score),
    headline:
      input.packingTasksToday > 0
        ? `${input.packingTasksToday} packing task${input.packingTasksToday === 1 ? "" : "s"} today`
        : "No packing tasks scheduled today",
    metrics: [
      { label: "Tasks", value: input.packingTasksToday },
      { label: "Waves", value: input.packingWavesToday },
      { label: "Pending", value: input.packingPending },
    ],
    recommendation:
      input.packingPending > 0
        ? "Complete label and allergen checks before event handoff windows."
        : input.upcomingEvents > 0
          ? "Convert accepted quotes to orders to generate packing waves."
          : "Packing idle — schedule events or convert quotes to production orders.",
    href: "/dashboard/packing",
  };
}

export function buildRoutesModule(kpis: RouteOverviewKpis, deliveryEvents: number): CateringOsModuleSnapshot {
  const score =
    kpis.routesNeedingAttention > 0 || kpis.failedStops > 0
      ? 2
      : deliveryEvents > 0 && kpis.routesPlanned === 0
        ? 1
        : kpis.routesPlanned === 0
          ? -1
          : 0;

  return {
    module: "routes",
    label: "Routes",
    status: moduleStatus(score),
    headline:
      kpis.routesPlanned > 0
        ? `${kpis.routesPlanned} delivery route${kpis.routesPlanned === 1 ? "" : "s"} today`
        : "No routes planned for today",
    metrics: [
      { label: "Routes", value: kpis.routesPlanned },
      { label: "Stops ready", value: kpis.stopsReady },
      { label: "Delivery events", value: deliveryEvents },
    ],
    recommendation:
      kpis.failedStops > 0
        ? `${kpis.failedStops} failed stop${kpis.failedStops === 1 ? "" : "s"} — reschedule catering drops.`
        : deliveryEvents > 0 && kpis.routesPlanned === 0
          ? "Assign delivery routes for upcoming drop-off catering events."
          : "Routes on track — confirm driver manifests for event windows.",
    href: "/dashboard/routes",
  };
}

export function buildCateringOsAlerts(modules: CateringOsModuleSnapshot[]): CateringOsAlert[] {
  return modules
    .filter((row) => row.status === "critical" || row.status === "watch" || row.status === "idle")
    .map((row) => ({
      id: `${row.module}-${row.status}`,
      module: row.module,
      severity: row.status === "critical" ? "warning" : "info",
      message: `${row.label}: ${row.recommendation}`,
    }));
}

export function buildCateringOsDashboard(input: CateringOsRawInput): CateringOsDashboard {
  const analyzedAt = input.analyzedAt ?? new Date();
  const modules = [
    buildEventsModule(input.upcomingEvents, input.openQuotes),
    buildClientsModule(input.topClients, input.openQuotes),
    buildPackingModule({
      packingTasksToday: input.packingTasksToday,
      packingWavesToday: input.packingWavesToday,
      packingPending: input.packingPending,
      upcomingEvents: input.upcomingEvents.length,
    }),
    buildRoutesModule(input.routeKpis, input.deliveryEvents),
  ];

  return {
    policyId: CATERING_OS_POLICY_ID,
    workspaceId: input.workspaceId,
    generatedAtIso: analyzedAt.toISOString(),
    modules,
    upcomingEvents: input.upcomingEvents.slice(0, 8),
    topClients: input.topClients.slice(0, 6),
    alerts: buildCateringOsAlerts(modules),
    summary: {
      openQuotes: input.openQuotes,
      acceptedQuotes: input.acceptedQuotes,
      upcomingEvents: input.upcomingEvents.length,
      activeClients: input.topClients.length,
      packingTasksToday: input.packingTasksToday,
      routesPlannedToday: input.routeKpis.routesPlanned,
      deliveryEvents: input.deliveryEvents,
      pipelineValue: input.pipelineValue,
    },
    basePath: CATERING_OS_PATH,
  };
}

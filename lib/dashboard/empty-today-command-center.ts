import type { TodayCommandCenterPayload } from "@/services/today/today-command-center-service";

/** Minimal Today payload when loaders fail — keeps /dashboard/today renderable. */
export function emptyTodayCommandCenterPayload(): TodayCommandCenterPayload {
  return {
    settings: null,
    kpis: {
      ordersDueToday: 0,
      ordersToday: 0,
      activeOrders: 0,
      productionAvgPct: 0,
      openTasks: 0,
      overdueTasks: 0,
      routesToday: 0,
      failedWebhooks: 0,
      webhooksNeedingAttention: 0,
      errorIntegrations: 0,
      failedExternalOrders: 0,
      unmatchedExternalProducts: 0,
      openSupportTickets: 0,
      integrityIssueCount: 0,
      revenueWeek: 0,
      revenueToday: 0,
      posTransactionsToday: 0,
      posKitchenQueueToday: 0,
      blockedOrdersApprox: 0,
      packingQueueOpen: 0,
      productionWorkOpen: 0,
      confirmedOrders: 0,
    },
    ordersDueToday: [],
    openTasks: [],
    routesToday: [],
    blockers: [],
    readiness: { overall: 0, categories: [] },
    shortageReadiness: {
      level: "NOT_CONFIGURED",
      summary: "Shortage readiness unavailable.",
      recipeCount: 0,
      ingredientsWithStockRows: 0,
      demandRuns: 0,
    },
  };
}

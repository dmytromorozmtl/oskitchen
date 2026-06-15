import type { TodayBlocker } from "@/services/today/today-command-center-service";

export type TodayCommandCenterKpis = {
  ordersDueToday: number;
  ordersToday: number;
  activeOrders: number;
  openTasks: number;
  overdueTasks: number;
  failedWebhooks: number;
  blockedOrdersApprox: number;
  posTransactionsToday: number;
  packingQueueOpen: number;
  productionWorkOpen: number;
  posKitchenQueueToday: number;
};

export type TodayOperationalPulseItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
};

/** True when no blockers and no active shift signals — hide KPI wall by default. */
export function isTodayShiftQuiet(
  kpis: TodayCommandCenterKpis,
  blockers: readonly TodayBlocker[],
): boolean {
  if (blockers.length > 0) return false;
  return (
    kpis.ordersToday === 0 &&
    kpis.activeOrders === 0 &&
    kpis.openTasks === 0 &&
    kpis.failedWebhooks === 0 &&
    kpis.blockedOrdersApprox === 0 &&
    kpis.posTransactionsToday === 0 &&
    kpis.packingQueueOpen === 0 &&
    kpis.productionWorkOpen === 0 &&
    kpis.ordersDueToday === 0 &&
    kpis.posKitchenQueueToday === 0
  );
}

export function shouldCollapseTodayKpiWall(input: {
  quiet: boolean;
  showFullMetrics: boolean;
}): boolean {
  return input.quiet && !input.showFullMetrics;
}

/** Compact operational pulse when the shift is active but blockers are clear. */
export function listTodayOperationalPulse(
  kpis: TodayCommandCenterKpis,
): TodayOperationalPulseItem[] {
  const items: TodayOperationalPulseItem[] = [];

  if (kpis.blockedOrdersApprox > 0) {
    items.push({
      id: "blocked-orders",
      title: "Blocked orders",
      detail: `${kpis.blockedOrdersApprox} order(s) may be stuck in the pipeline.`,
      href: "/dashboard/order-hub",
      priority: 5,
    });
  }
  if (kpis.packingQueueOpen > 0) {
    items.push({
      id: "packing-queue",
      title: "Packing queue",
      detail: `${kpis.packingQueueOpen} pack job(s) open.`,
      href: "/dashboard/packing",
      priority: 6,
    });
  }
  if (kpis.productionWorkOpen > 0) {
    items.push({
      id: "production-open",
      title: "Production work",
      detail: `${kpis.productionWorkOpen} production task(s) in progress.`,
      href: "/dashboard/production",
      priority: 7,
    });
  }
  if (kpis.posKitchenQueueToday > 0) {
    items.push({
      id: "pos-kitchen-queue",
      title: "POS in kitchen",
      detail: `${kpis.posKitchenQueueToday} POS sale(s) awaiting kitchen prep.`,
      href: "/dashboard/kitchen",
      priority: 8,
    });
  }
  if (kpis.ordersDueToday > 0) {
    items.push({
      id: "orders-due-today",
      title: "Orders due today",
      detail: `${kpis.ordersDueToday} order(s) scheduled for today.`,
      href: "/dashboard/orders",
      priority: 9,
    });
  }
  if (kpis.activeOrders > 0) {
    items.push({
      id: "active-pipeline",
      title: "Active pipeline",
      detail: `${kpis.activeOrders} order(s) in flight.`,
      href: "/dashboard/order-hub",
      priority: 10,
    });
  }
  if (kpis.openTasks > 0) {
    items.push({
      id: "open-tasks",
      title: "Open tasks",
      detail:
        kpis.overdueTasks > 0
          ? `${kpis.openTasks} task(s) open · ${kpis.overdueTasks} overdue.`
          : `${kpis.openTasks} task(s) open.`,
      href: "/dashboard/tasks",
      priority: 11,
    });
  }
  if (kpis.posTransactionsToday > 0) {
    items.push({
      id: "pos-today",
      title: "POS activity",
      detail: `${kpis.posTransactionsToday} transaction(s) today.`,
      href: "/dashboard/pos/transactions",
      priority: 12,
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

export function pickTodayAttentionItems(input: {
  blockers: readonly TodayBlocker[];
  kpis: TodayCommandCenterKpis;
}): Array<TodayBlocker | TodayOperationalPulseItem> {
  if (input.blockers.length > 0) {
    return input.blockers.slice(0, 5);
  }
  return listTodayOperationalPulse(input.kpis);
}

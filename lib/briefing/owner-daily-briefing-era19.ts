import type { TodayBlocker } from "@/services/today/today-command-center-service";
import {
  enrichBriefingTilesLinks,
  normalizeBriefingOperationalHref,
} from "@/lib/briefing/owner-daily-briefing-tile-links-era19";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { resolvePackingBriefingQcHref } from "@/lib/packing/packing-qc-clarity-era19";

export type BriefingTileAvailability = "available" | "not_configured" | "unavailable";

export type BriefingTileLinkState = "operational" | "blocked" | "empty" | "setup_needed";

export type OwnerDailyBriefingTile = {
  id: string;
  category:
    | "orders"
    | "kitchen"
    | "production"
    | "packing"
    | "integrations"
    | "go-live"
    | "pilot"
    | "sso"
    | "revenue"
    | "inventory"
    | "labor"
    | "pos";
  label: string;
  value: string;
  detail: string;
  whyItMatters: string;
  href: string;
  availability: BriefingTileAvailability;
  linkState: BriefingTileLinkState;
  tone: "neutral" | "attention" | "success";
  priority: number;
};

export type OwnerDailyBriefingAlert = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type OwnerDailyBriefingNextAction = {
  id: string;
  title: string;
  detail: string;
  href: string;
  ctaLabel: string;
  tone: "urgent" | "normal" | "success";
};

export type OwnerDailyBriefingActionSeverity = "critical" | "high" | "normal" | "low";

export type OwnerDailyBriefingActionRole =
  | "owner"
  | "manager"
  | "kitchen"
  | "cashier"
  | "support";

export type OwnerDailyBriefingRankedAction = {
  id: string;
  title: string;
  reason: string;
  severity: OwnerDailyBriefingActionSeverity;
  ownerRole: OwnerDailyBriefingActionRole;
  href: string;
  status: "open" | "monitor" | "ready";
  unblockCondition: string;
  priority: number;
  ctaLabel: string;
  tone: OwnerDailyBriefingNextAction["tone"];
};

export type OwnerDailyBriefingInput = {
  kpis: {
    ordersToday: number;
    ordersDueToday: number;
    activeOrders: number;
    blockedOrdersApprox: number;
    posKitchenQueueToday: number;
    posTransactionsToday: number;
    productionWorkOpen: number;
    packingQueueOpen: number;
    revenueToday: number;
    errorIntegrations: number;
    webhooksNeedingAttention: number;
    failedExternalOrders: number;
    openSupportTickets: number;
    overdueTasks: number;
  };
  blockers: readonly TodayBlocker[];
  readinessOverall: number;
  integrationOverall: "healthy" | "degraded" | "down" | "unknown";
  integrationHeadline: string;
  pilotAttentionCount: number;
  pilotHasUrgent: boolean;
  ssoEntitlementEnabled: boolean;
  ssoActive: boolean;
  ssoConfigured: boolean;
  lowStockCount: number;
  ingredientParConfigured: boolean;
  labor: {
    available: boolean;
    activeStaff: number;
    scheduledShiftsToday: number;
    laborPercent: number;
    status: "OVER" | "ON_TRACK" | "UNDER" | null;
  };
  productionCalendar?: {
    summary: {
      overdue: number;
      dueToday: number;
      inProgress: number;
      completedToday: number;
    };
    hasPlanTasks: boolean;
    calendarHref: string;
    primaryHref: string;
  };
  posShift?: {
    openCount: number;
  };
};

export type OwnerDailyBriefingTileDraft = Omit<
  OwnerDailyBriefingTile,
  "whyItMatters" | "linkState"
>;

export function buildOwnerDailyBriefingTiles(
  input: OwnerDailyBriefingInput,
): OwnerDailyBriefingTile[] {
  const tiles: OwnerDailyBriefingTileDraft[] = [];

  tiles.push({
    id: "orders-today",
    category: "orders",
    label: "Orders today",
    value: String(input.kpis.ordersToday),
    detail:
      input.kpis.ordersDueToday > 0
        ? `${input.kpis.ordersDueToday} due today · ${input.kpis.activeOrders} active`
        : `${input.kpis.activeOrders} in active pipeline`,
    href: "/dashboard/orders",
    availability: "available",
    tone: input.kpis.ordersToday > 0 ? "neutral" : "neutral",
    priority: 10,
  });

  tiles.push({
    id: "stuck-orders",
    category: "orders",
    label: "Stuck orders",
    value: String(input.kpis.blockedOrdersApprox),
    detail:
      input.kpis.blockedOrdersApprox > 0
        ? "Orders may be blocked in the pipeline — review Order Hub."
        : "No stuck-order signals right now.",
    href: "/dashboard/order-hub",
    availability: "available",
    tone: input.kpis.blockedOrdersApprox > 0 ? "attention" : "success",
    priority: input.kpis.blockedOrdersApprox > 0 ? 2 : 20,
  });

  const kdsPressure = input.kpis.posKitchenQueueToday + input.kpis.productionWorkOpen;
  tiles.push({
    id: "kds-pressure",
    category: "kitchen",
    label: "KDS pressure",
    value: String(kdsPressure),
    detail:
      kdsPressure > 0
        ? `${input.kpis.posKitchenQueueToday} POS in kitchen · ${input.kpis.productionWorkOpen} production open`
        : "Kitchen queue is clear.",
    href: "/dashboard/kitchen",
    availability: "available",
    tone: kdsPressure > 0 ? "attention" : "success",
    priority: kdsPressure > 0 ? 3 : 21,
  });

  tiles.push({
    id: "production-priorities",
    category: "production",
    label: "Production work open",
    value: String(input.kpis.productionWorkOpen),
    detail:
      input.kpis.productionWorkOpen > 0
        ? "Open kitchen work items — check production board."
        : "No open production work items on the board.",
    href: "/dashboard/production",
    availability: "available",
    tone: input.kpis.productionWorkOpen > 0 ? "attention" : "success",
    priority: 14,
  });

  if (input.productionCalendar) {
    const cal = input.productionCalendar;
    const openCount = cal.summary.overdue + cal.summary.dueToday;
    const attention = cal.summary.overdue > 0 || cal.summary.dueToday > 0;

    let detail: string;
    if (!cal.hasPlanTasks) {
      detail = "No production calendar batches through today — schedule prep on the calendar.";
    } else if (cal.summary.overdue > 0) {
      detail = `${cal.summary.overdue} overdue · ${cal.summary.dueToday} due today · ${cal.summary.inProgress} in progress`;
    } else if (cal.summary.dueToday > 0) {
      detail = `${cal.summary.dueToday} due today · ${cal.summary.inProgress} in progress · ${cal.summary.completedToday} completed`;
    } else {
      detail = `${cal.summary.completedToday} completed today — no overdue or due-today batches.`;
    }

    tiles.push({
      id: "production-calendar-today",
      category: "production",
      label: "Production calendar",
      value: String(openCount),
      detail,
      href: cal.primaryHref,
      availability: cal.hasPlanTasks ? "available" : "not_configured",
      tone: attention ? "attention" : cal.hasPlanTasks ? "success" : "neutral",
      priority: cal.summary.overdue > 0 ? 4 : cal.summary.dueToday > 0 ? 13 : 24,
    });
  }

  tiles.push({
    id: "packing-status",
    category: "packing",
    label: "Packing queue",
    value: String(input.kpis.packingQueueOpen),
    detail:
      input.kpis.packingQueueOpen > 0
        ? `${input.kpis.packingQueueOpen} pack job(s) open.`
        : "Packing queue is clear.",
    href: resolvePackingBriefingQcHref({
      packingQueueOpen: input.kpis.packingQueueOpen,
    }),
    availability: "available",
    tone: input.kpis.packingQueueOpen > 0 ? "attention" : "success",
    priority: 15,
  });

  tiles.push({
    id: "integration-health",
    category: "integrations",
    label: "Integrations",
    value:
      input.integrationOverall === "unknown"
        ? "—"
        : input.integrationOverall.replace("_", " "),
    detail: input.integrationHeadline,
    href: "/dashboard/integration-health",
    availability: input.integrationOverall === "unknown" ? "unavailable" : "available",
    tone:
      input.integrationOverall === "down" || input.integrationOverall === "degraded"
        ? "attention"
        : input.integrationOverall === "healthy"
          ? "success"
          : "neutral",
    priority:
      input.integrationOverall === "down"
        ? 1
        : input.integrationOverall === "degraded"
          ? 4
          : 22,
  });

  tiles.push({
    id: "go-live-readiness",
    category: "go-live",
    label: "Go-live readiness",
    value: `${input.readinessOverall}%`,
    detail:
      input.readinessOverall >= 85
        ? "Setup looks strong — validate launch checklist."
        : "Complete setup categories before pilot cutover.",
    href: "/dashboard/launch-wizard",
    availability: "available",
    tone: input.readinessOverall >= 85 ? "success" : input.readinessOverall >= 60 ? "neutral" : "attention",
    priority: 16,
  });

  tiles.push({
    id: "pilot-status",
    category: "pilot",
    label: "Pilot readiness",
    value: input.pilotAttentionCount > 0 ? `${input.pilotAttentionCount} gap(s)` : "On track",
    detail:
      input.pilotAttentionCount > 0
        ? "Channel, SSO, or launch validation needs attention."
        : "No pilot readiness gaps surfaced.",
    href: "/dashboard/launch-wizard",
    availability: "available",
    tone: input.pilotHasUrgent ? "attention" : input.pilotAttentionCount > 0 ? "neutral" : "success",
    priority: input.pilotHasUrgent ? 5 : 17,
  });

  if (input.ssoEntitlementEnabled) {
    tiles.push({
      id: "sso-proof",
      category: "sso",
      label: "SSO pilot",
      value: input.ssoActive ? "Active" : input.ssoConfigured ? "Configured" : "Setup needed",
      detail: input.ssoActive
        ? "SSO pilot is active for this workspace — IdP login proof remains ops-gated."
        : "Enterprise SSO pilot wiring — not production SSO for all tenants.",
      href: "/dashboard/settings/security/sso",
      availability: "available",
      tone: input.ssoActive ? "success" : "attention",
      priority: 18,
    });
  } else {
    tiles.push({
      id: "sso-proof",
      category: "sso",
      label: "SSO pilot",
      value: "Not entitled",
      detail: "SSO add-on not enabled for this workspace.",
      href: "/dashboard/settings/security/sso",
      availability: "not_configured",
      tone: "neutral",
      priority: 30,
    });
  }

  tiles.push({
    id: "revenue-snapshot",
    category: "revenue",
    label: "Revenue today",
    value: formatBriefingCurrency(input.kpis.revenueToday),
    detail: "Workspace order revenue today (confirmed+ pipeline).",
    href: "/dashboard/analytics",
    availability: "available",
    tone: "neutral",
    priority: 11,
  });

  tiles.push({
    id: "pos-transactions-today",
    category: "pos",
    label: "POS transactions today",
    value: String(input.kpis.posTransactionsToday),
    detail:
      input.kpis.posTransactionsToday > 0
        ? "Register sales recorded today — open POS hub for receipts."
        : "No POS transactions yet today.",
    href: "/dashboard/pos/transactions",
    availability: "available",
    tone: input.kpis.posTransactionsToday > 0 ? "neutral" : "neutral",
    priority: 12,
  });

  if (input.posShift !== undefined) {
    tiles.push({
      id: "pos-open-shifts",
      category: "pos",
      label: "Open POS shifts",
      value: String(input.posShift.openCount),
      detail:
        input.posShift.openCount > 0
          ? `${input.posShift.openCount} register shift(s) open — close when done.`
          : "No open register shift — open a shift before ringing sales.",
      href: "/dashboard/pos/shifts",
      availability: "available",
      tone: input.posShift.openCount > 0 ? "success" : "attention",
      priority: input.posShift.openCount > 0 ? 18 : 5,
    });
  }

  if (input.ingredientParConfigured) {
    tiles.push({
      id: "low-stock",
      category: "inventory",
      label: "Low stock",
      value: String(input.lowStockCount),
      detail:
        input.lowStockCount > 0
          ? "Ingredient(s) below par level — review purchasing."
          : "No ingredients below par level.",
      href: "/dashboard/purchasing",
      availability: "available",
      tone: input.lowStockCount > 0 ? "attention" : "success",
      priority: input.lowStockCount > 0 ? 6 : 23,
    });
  } else {
    tiles.push({
      id: "low-stock",
      category: "inventory",
      label: "Low stock",
      value: "—",
      detail: "Set par levels on ingredients to enable low-stock alerts.",
      href: "/dashboard/inventory",
      availability: "not_configured",
      tone: "neutral",
      priority: 30,
    });
  }

  if (input.labor.available) {
    tiles.push({
      id: "labor-coverage",
      category: "labor",
      label: "Labor coverage",
      value: `${input.labor.activeStaff} on clock`,
      detail:
        input.labor.scheduledShiftsToday > 0
          ? `${input.labor.scheduledShiftsToday} shift(s) scheduled · labor ${input.labor.laborPercent}% of revenue`
          : `Labor ${input.labor.laborPercent}% of revenue today`,
      href: "/dashboard/labor",
      availability: "available",
      tone: input.labor.status === "OVER" ? "attention" : "neutral",
      priority: 19,
    });
  } else {
    tiles.push({
      id: "labor-coverage",
      category: "labor",
      label: "Labor coverage",
      value: "—",
      detail: "Time clock or schedule data not available yet.",
      href: "/dashboard/labor",
      availability: "unavailable",
      tone: "neutral",
      priority: 30,
    });
  }

  return enrichBriefingTilesLinks(tiles.sort((a, b) => a.priority - b.priority));
}

export function buildOwnerDailyBriefingAlerts(input: {
  blockers: readonly TodayBlocker[];
  pilotAlerts: readonly OwnerDailyBriefingAlert[];
  productionCalendarAlerts?: readonly OwnerDailyBriefingAlert[];
  kpis: OwnerDailyBriefingInput["kpis"];
}): OwnerDailyBriefingAlert[] {
  const alerts: OwnerDailyBriefingAlert[] = [];

  for (const blocker of input.blockers.slice(0, 3)) {
    alerts.push({
      id: `blocker-${blocker.id}`,
      title: blocker.title,
      detail: blocker.detail,
      href: normalizeBriefingOperationalHref(blocker.href),
      priority: blocker.priority,
      tone: "urgent",
    });
  }

  if (input.kpis.overdueTasks > 0) {
    alerts.push({
      id: "overdue-tasks",
      title: "Overdue tasks",
      detail: `${input.kpis.overdueTasks} task(s) past due — review kitchen and ops tasks.`,
      href: "/dashboard/tasks",
      priority: 7,
      tone: "urgent",
    });
  }

  if (input.kpis.openSupportTickets > 0) {
    alerts.push({
      id: "support-open",
      title: "Open support tickets",
      detail: `${input.kpis.openSupportTickets} ticket(s) need resolution.`,
      href: "/dashboard/support/inbox",
      priority: 9,
      tone: "normal",
    });
  }

  alerts.push(...input.pilotAlerts);
  alerts.push(...(input.productionCalendarAlerts ?? []));

  return alerts.sort((a, b) => a.priority - b.priority).slice(0, 8);
}

function rankedActionToNext(action: OwnerDailyBriefingRankedAction): OwnerDailyBriefingNextAction {
  return {
    id: action.id,
    title: action.title,
    detail: action.reason,
    href: action.href,
    ctaLabel: action.ctaLabel,
    tone: action.tone,
  };
}

export function pickOwnerDailyBriefingTopActions(input: {
  blockers: readonly TodayBlocker[];
  alerts: readonly OwnerDailyBriefingAlert[];
  readinessOverall: number;
  kpis: OwnerDailyBriefingInput["kpis"];
  pilotAttentionCount: number;
  integrationOverall: OwnerDailyBriefingInput["integrationOverall"];
  lowStockCount: number;
  productionCalendarActions?: readonly OwnerDailyBriefingRankedAction[];
}): OwnerDailyBriefingRankedAction[] {
  const candidates: OwnerDailyBriefingRankedAction[] = [];

  candidates.push(...(input.productionCalendarActions ?? []));

  for (const blocker of input.blockers) {
    candidates.push({
      id: `blocker-${blocker.id}`,
      title: blocker.title,
      reason: blocker.detail,
      severity: "critical",
      ownerRole: blocker.id.includes("integration") ? "owner" : "manager",
      href: normalizeBriefingOperationalHref(blocker.href),
      status: "open",
      unblockCondition: "Resolve the blocker and refresh Today.",
      priority: blocker.priority,
      ctaLabel: "Fix blocker",
      tone: "urgent",
    });
  }

  for (const alert of input.alerts) {
    if (candidates.some((item) => item.href === alert.href)) continue;
    candidates.push({
      id: `alert-${alert.id}`,
      title: alert.title,
      reason: alert.detail,
      severity: alert.tone === "urgent" ? "high" : "normal",
      ownerRole: alert.id.startsWith("gate-") || alert.id.includes("pilot") ? "owner" : "manager",
      href: alert.href,
      status: "open",
      unblockCondition: "Clear the alert condition and re-check briefing.",
      priority: alert.priority + (alert.tone === "urgent" ? 0 : 5),
      ctaLabel: alert.tone === "urgent" ? "Review alert" : "Open",
      tone: alert.tone === "urgent" ? "urgent" : "normal",
    });
  }

  if (input.kpis.blockedOrdersApprox > 0) {
    candidates.push({
      id: "stuck-orders-action",
      title: "Review stuck orders",
      reason: `${input.kpis.blockedOrdersApprox} order(s) may be blocked in Order Hub.`,
      severity: "high",
      ownerRole: "manager",
      href: "/dashboard/order-hub",
      status: "open",
      unblockCondition: "Unblock or re-route affected orders.",
      priority: 6,
      ctaLabel: "Open Order Hub",
      tone: "urgent",
    });
  }

  if (input.integrationOverall === "down" || input.integrationOverall === "degraded") {
    candidates.push({
      id: "integration-health-action",
      title: "Review integration health",
      reason:
        input.integrationOverall === "down"
          ? "One or more integrations are in error — channel orders may fail."
          : "Integrations need attention before scaling pilot traffic.",
      severity: input.integrationOverall === "down" ? "critical" : "high",
      ownerRole: "owner",
      href: "/dashboard/integration-health",
      status: "open",
      unblockCondition: "Restore healthy integration status or pause channel intake.",
      priority: input.integrationOverall === "down" ? 2 : 7,
      ctaLabel: "Open health center",
      tone: "urgent",
    });
  }

  if (input.kpis.packingQueueOpen > 0) {
    candidates.push({
      id: "packing-queue-action",
      title: "Clear packing queue",
      reason: `${input.kpis.packingQueueOpen} pack job(s) waiting — fulfillment may slip.`,
      severity: "normal",
      ownerRole: "manager",
      href: resolvePackingBriefingQcHref({
        packingQueueOpen: input.kpis.packingQueueOpen,
      }),
      status: "open",
      unblockCondition: "Complete or reassign open pack jobs.",
      priority: 8,
      ctaLabel: "Open packing",
      tone: "normal",
    });
  }

  const kdsPressure = input.kpis.posKitchenQueueToday + input.kpis.productionWorkOpen;
  if (kdsPressure > 0) {
    candidates.push({
      id: "kds-pressure-action",
      title: "Relieve kitchen pressure",
      reason: `${kdsPressure} ticket(s) or production item(s) need kitchen attention.`,
      severity: "normal",
      ownerRole: "kitchen",
      href: "/dashboard/kitchen",
      status: "open",
      unblockCondition: "Bump or complete kitchen tickets to clear the queue.",
      priority: 9,
      ctaLabel: "Open KDS",
      tone: "normal",
    });
  }

  if (input.lowStockCount > 0) {
    candidates.push({
      id: "low-stock-action",
      title: "Review low stock",
      reason: `${input.lowStockCount} ingredient(s) below par — purchasing may be needed.`,
      severity: "normal",
      ownerRole: "manager",
      href: "/dashboard/purchasing",
      status: "monitor",
      unblockCondition: "Receive stock or adjust par levels.",
      priority: 11,
      ctaLabel: "Open purchasing",
      tone: "normal",
    });
  }

  if (input.pilotAttentionCount > 0) {
    candidates.push({
      id: "pilot-readiness-action",
      title: "Close pilot readiness gaps",
      reason: `${input.pilotAttentionCount} channel, SSO, or go-live gap(s) block a clean pilot launch.`,
      severity: "high",
      ownerRole: "owner",
      href: LAUNCH_WIZARD_ROUTE,
      status: "open",
      unblockCondition: "Complete launch wizard steps and commercial evidence gates.",
      priority: 12,
      ctaLabel: "Open launch wizard",
      tone: "normal",
    });
  }

  if (input.readinessOverall < 70) {
    candidates.push({
      id: "go-live-setup-action",
      title: "Finish workspace setup",
      reason: `Go-live readiness is ${input.readinessOverall}% — close setup before pilot traffic.`,
      severity: "normal",
      ownerRole: "owner",
      href: LAUNCH_WIZARD_ROUTE,
      status: "open",
      unblockCondition: "Complete launch wizard setup categories above 85%.",
      priority: 13,
      ctaLabel: "Open launch wizard",
      tone: "normal",
    });
  }

  if (input.kpis.ordersToday === 0 && input.kpis.activeOrders === 0) {
    candidates.push({
      id: "start-service-action",
      title: "Start today's service",
      reason: "No orders yet — verify storefront, channels, or create a manual order.",
      severity: "low",
      ownerRole: "owner",
      href: "/dashboard/orders/new",
      status: "ready",
      unblockCondition: "First order of the day lands in Order Hub.",
      priority: 20,
      ctaLabel: "Create order",
      tone: "success",
    });
  }

  candidates.push({
    id: "monitor-order-hub",
    title: "Monitor active pipeline",
    reason: `${input.kpis.activeOrders} active order(s) — keep handoffs moving through kitchen and packing.`,
    severity: "low",
    ownerRole: "manager",
    href: "/dashboard/order-hub",
    status: input.kpis.activeOrders > 0 ? "monitor" : "ready",
    unblockCondition: "Pipeline clears to completed or scheduled states.",
    priority: 25,
    ctaLabel: "Open Order Hub",
    tone: "success",
  });

  const seen = new Set<string>();
  return candidates
    .sort((a, b) => a.priority - b.priority)
    .filter((action) => {
      const key = `${action.href}:${action.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);
}

export function pickOwnerDailyBriefingNextAction(input: {
  blockers: readonly TodayBlocker[];
  alerts: readonly OwnerDailyBriefingAlert[];
  readinessOverall: number;
  kpis: OwnerDailyBriefingInput["kpis"];
  pilotAttentionCount?: number;
  integrationOverall?: OwnerDailyBriefingInput["integrationOverall"];
  lowStockCount?: number;
}): OwnerDailyBriefingNextAction {
  const top = pickOwnerDailyBriefingTopActions({
    blockers: input.blockers,
    alerts: input.alerts,
    readinessOverall: input.readinessOverall,
    kpis: input.kpis,
    pilotAttentionCount: input.pilotAttentionCount ?? 0,
    integrationOverall: input.integrationOverall ?? "unknown",
    lowStockCount: input.lowStockCount ?? 0,
  })[0];

  if (top) return rankedActionToNext(top);

  return {
    id: "fallback-order-hub",
    title: "Run the shift from Order Hub",
    detail: `${input.kpis.activeOrders} active order(s) — monitor pipeline and kitchen handoff.`,
    href: "/dashboard/order-hub",
    ctaLabel: "Open Order Hub",
    tone: "success",
  };
}

export function pickOwnerDailyBriefingHeroTiles(
  tiles: readonly OwnerDailyBriefingTile[],
): OwnerDailyBriefingTile[] {
  const attention = tiles.filter((tile) => tile.tone === "attention");
  const operational = tiles.filter(
    (tile) =>
      tile.tone !== "attention" &&
      tile.availability === "available" &&
      ["orders", "kitchen", "revenue", "packing", "production"].includes(tile.category),
  );

  const picked = [...attention.slice(0, 4), ...operational.slice(0, 4)];
  const seen = new Set<string>();
  return picked.filter((tile) => {
    if (seen.has(tile.id)) return false;
    seen.add(tile.id);
    return true;
  }).slice(0, 8);
}

function formatBriefingCurrency(amount: number): string {
  if (amount <= 0) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

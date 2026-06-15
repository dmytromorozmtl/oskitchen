import { isWorkLate } from "@/lib/production/production-status";
import type { ProductionWorkStatus } from "@prisma/client";

export type ProductionBoardWorkItemFocus = {
  id: string;
  title: string;
  status: ProductionWorkStatus;
  station: string | null;
  dueAt: string | null;
  requiresPacking: boolean;
};

export type ProductionBoardStationWarning = {
  station: string;
  count: number;
  overloaded: boolean;
};

export type ProductionBoardFocusSnapshot = {
  lateCount: number;
  holdCount: number;
  packHandoffCount: number;
  overloadedStationCount: number;
  inProgressCount: number;
};

export type ProductionBoardAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type ProductionWorkItemRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

const TERMINAL_STATUSES = new Set<ProductionWorkStatus>(["DONE", "CANCELLED"]);

function parseDueAt(dueAt: string | null): Date | null {
  if (!dueAt) return null;
  const parsed = new Date(dueAt);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function productionWorkItemAnchor(workItemId: string): string {
  return `#production-work-${workItemId}`;
}

export function buildProductionBoardFocusSnapshot(
  workItems: readonly ProductionBoardWorkItemFocus[],
  stationWarnings: readonly ProductionBoardStationWarning[],
  now = Date.now(),
): ProductionBoardFocusSnapshot {
  let lateCount = 0;
  let holdCount = 0;
  let packHandoffCount = 0;
  let inProgressCount = 0;

  for (const item of workItems) {
    if (TERMINAL_STATUSES.has(item.status)) continue;

    if (item.status === "HOLD") holdCount += 1;
    if (item.status === "IN_PROGRESS") inProgressCount += 1;
    if (item.status === "PACK_HANDOFF" || (item.requiresPacking && item.status === "READY")) {
      packHandoffCount += 1;
    }

    const due = parseDueAt(item.dueAt);
    if (isWorkLate(due, item.status)) lateCount += 1;
  }

  const overloadedStationCount = stationWarnings.filter((warning) => warning.overloaded).length;

  return {
    lateCount,
    holdCount,
    packHandoffCount,
    overloadedStationCount,
    inProgressCount,
  };
}

export function summarizeProductionBoardFocus(
  focus: ProductionBoardFocusSnapshot,
): { totalSignals: number; hasUrgent: boolean } {
  const totalSignals =
    focus.lateCount +
    focus.holdCount +
    focus.packHandoffCount +
    focus.overloadedStationCount;

  return {
    totalSignals,
    hasUrgent: focus.lateCount > 0 || focus.holdCount > 0 || focus.overloadedStationCount > 0,
  };
}

function firstLateItem(
  workItems: readonly ProductionBoardWorkItemFocus[],
): ProductionBoardWorkItemFocus | null {
  for (const item of workItems) {
    if (TERMINAL_STATUSES.has(item.status)) continue;
    if (isWorkLate(parseDueAt(item.dueAt), item.status)) return item;
  }
  return null;
}

function firstHoldItem(
  workItems: readonly ProductionBoardWorkItemFocus[],
): ProductionBoardWorkItemFocus | null {
  return workItems.find((item) => item.status === "HOLD") ?? null;
}

/** Production command center — late tasks and station overload first. */
export function pickProductionBoardAttentionItems(
  workItems: readonly ProductionBoardWorkItemFocus[],
  focus: ProductionBoardFocusSnapshot,
  stationWarnings: readonly ProductionBoardStationWarning[],
  productionDateIso: string,
): ProductionBoardAttentionItem[] {
  const items: ProductionBoardAttentionItem[] = [];
  const dateQuery = productionDateIso.slice(0, 10);

  if (focus.lateCount > 0) {
    const late = firstLateItem(workItems);
    items.push({
      id: "late-tasks",
      title: `${focus.lateCount} late production task${focus.lateCount === 1 ? "" : "s"}`,
      detail: late
        ? `Oldest: ${late.title} — advance status or reassign station before service.`
        : "Tasks are past due — review prep list and board columns.",
      href: late ? productionWorkItemAnchor(late.id) : `/dashboard/production?date=${dateQuery}&view=prep`,
      priority: 4,
      tone: "urgent",
    });
  }

  if (focus.holdCount > 0) {
    const hold = firstHoldItem(workItems);
    items.push({
      id: "hold-tasks",
      title: `${focus.holdCount} task${focus.holdCount === 1 ? "" : "s"} on hold`,
      detail: hold
        ? `${hold.title} is blocked — clear hold before downstream stations stall.`
        : "Release held tasks so prep can continue.",
      href: hold ? productionWorkItemAnchor(hold.id) : `/dashboard/production?date=${dateQuery}&view=board`,
      priority: 3,
      tone: "urgent",
    });
  }

  const overloaded = stationWarnings.filter((warning) => warning.overloaded);
  if (overloaded.length > 0) {
    const worst = overloaded[0]!;
    items.push({
      id: "station-overload",
      title: `${overloaded.length} overloaded station${overloaded.length === 1 ? "" : "s"}`,
      detail: `${worst.station} has ${worst.count} active lines — rebalance before rush.`,
      href: `/dashboard/production?date=${dateQuery}&view=stations`,
      priority: 2,
      tone: "urgent",
    });
  }

  if (focus.packHandoffCount > 0 && items.length < 4) {
    items.push({
      id: "pack-handoff",
      title: `${focus.packHandoffCount} pack handoff${focus.packHandoffCount === 1 ? "" : "s"} waiting`,
      detail: "Ready items need packing or labeling before pickup windows.",
      href: "/dashboard/packing",
      priority: 1,
      tone: focus.lateCount > 0 ? "normal" : "urgent",
    });
  }

  if (focus.inProgressCount > 0 && focus.lateCount === 0 && items.length < 4) {
    items.push({
      id: "in-progress",
      title: `${focus.inProgressCount} task${focus.inProgressCount === 1 ? "" : "s"} in progress`,
      detail: "Monitor board columns — advance to ready when prep completes.",
      href: `/dashboard/production?date=${dateQuery}&view=board`,
      priority: 1,
      tone: "normal",
    });
  }

  return items.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

/** Row-level next action for production work items. */
export function resolveProductionWorkItemRowNextAction(
  item: ProductionBoardWorkItemFocus,
): ProductionWorkItemRowNextAction | null {
  if (TERMINAL_STATUSES.has(item.status)) return null;

  const href = productionWorkItemAnchor(item.id);
  const due = parseDueAt(item.dueAt);

  if (item.status === "HOLD") {
    return { label: "Clear hold", href, tone: "urgent" };
  }

  if (isWorkLate(due, item.status)) {
    return { label: "Start prep — overdue", href, tone: "urgent" };
  }

  if (item.status === "PACK_HANDOFF" || (item.requiresPacking && item.status === "READY")) {
    return { label: "Open packing", href: "/dashboard/packing", tone: "urgent" };
  }

  if (item.status === "TO_PREP") {
    return { label: "Begin prep", href, tone: "normal" };
  }

  if (item.status === "IN_PROGRESS") {
    return { label: "Advance status", href, tone: "normal" };
  }

  if (item.status === "READY" || item.status === "HANDOFF") {
    return { label: "Station handoff", href: "/dashboard/production?view=stations", tone: "normal" };
  }

  return null;
}

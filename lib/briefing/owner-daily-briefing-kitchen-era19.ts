import {
  enrichBriefingTilesLinks,
  type BriefingTileLinkState,
} from "@/lib/briefing/owner-daily-briefing-tile-links-era19";
import type {
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
  OwnerDailyBriefingTileDraft,
} from "@/lib/briefing/owner-daily-briefing-era19";
import {
  BRIEFING_KDS_PRIORITY_LANE_HREF,
  KDS_KITCHEN_ROUTE,
} from "@/lib/kitchen/kds-priority-lane-era19-policy";
import {
  buildKdsPriorityLaneItems,
  isKdsPriorityLaneCandidate,
  partitionKdsQueueByPriority,
  resolveKdsPriorityReasons,
  shouldShowKdsPriorityLane,
  type KdsPriorityReason,
  type KdsPriorityTicket,
} from "@/lib/kitchen/kds-priority-lane-era19";
import { OWNER_DAILY_BRIEFING_KITCHEN_ERA19_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-kitchen-era19-policy";

export const OWNER_DAILY_BRIEFING_KITCHEN_AGGREGATOR_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-kitchen-aggregator-v1" as const;

export { OWNER_DAILY_BRIEFING_KITCHEN_ERA19_POLICY_ID };

export const BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID = "kds-priority-lane" as const;

export type OwnerDailyBriefingKitchenInput = {
  kdsOrders: readonly KdsPriorityTicket[];
  productionCalendarOverdue: number;
  productionCalendarDueToday: number;
  packingQueueOpen: number;
  productionWorkOpen: number;
};

export type OwnerDailyBriefingKitchenKdsSummary = {
  queueCount: number;
  preparingCount: number;
  readyCount: number;
  priorityCandidateCount: number;
  allergenPrepCount: number;
  overdueCount: number;
  showPriorityLane: boolean;
};

function draftTile(tile: OwnerDailyBriefingTileDraft): OwnerDailyBriefingTile {
  return enrichBriefingTilesLinks([tile])[0]!;
}

export function buildBriefingKitchenKdsSummary(
  orders: readonly KdsPriorityTicket[],
): OwnerDailyBriefingKitchenKdsSummary {
  const { preparing, ready } = partitionKdsQueueByPriority(orders);
  const priorityItems = buildKdsPriorityLaneItems(preparing, ready);

  let allergenPrepCount = 0;
  let overdueCount = 0;

  for (const order of orders) {
    if (!isKdsPriorityLaneCandidate(order)) continue;
    const reasons = resolveKdsPriorityReasons(order);
    if (reasons.includes("allergen")) allergenPrepCount += 1;
    if (reasons.includes("overdue_prep") || reasons.includes("overdue_expo")) {
      overdueCount += 1;
    }
  }

  return {
    queueCount: orders.length,
    preparingCount: preparing.length,
    readyCount: ready.length,
    priorityCandidateCount: priorityItems.length,
    allergenPrepCount,
    overdueCount,
    showPriorityLane: shouldShowKdsPriorityLane(orders),
  };
}

function priorityLaneDetail(summary: OwnerDailyBriefingKitchenKdsSummary): string {
  const parts: string[] = [];
  if (summary.allergenPrepCount > 0) {
    parts.push(
      `${summary.allergenPrepCount} allergy alert${summary.allergenPrepCount === 1 ? "" : "s"}`,
    );
  }
  if (summary.overdueCount > 0) {
    parts.push(`${summary.overdueCount} overdue ticket${summary.overdueCount === 1 ? "" : "s"}`);
  }
  if (parts.length === 0) {
    return `${summary.queueCount} ticket(s) on the line — priority lane ranks allergen and overdue first.`;
  }
  return `${parts.join(" · ")} — open the kitchen priority lane before bumping other tickets.`;
}

export function resolveBriefingKitchenPriorityLaneHref(
  summary: OwnerDailyBriefingKitchenKdsSummary,
): string {
  return summary.showPriorityLane ? BRIEFING_KDS_PRIORITY_LANE_HREF : KDS_KITCHEN_ROUTE;
}

export function resolveBriefingKitchenPriorityLaneLinkState(
  summary: OwnerDailyBriefingKitchenKdsSummary,
): BriefingTileLinkState {
  if (summary.queueCount === 0) return "empty";
  if (summary.showPriorityLane) return "operational";
  return "operational";
}

export function buildBriefingKitchenPriorityLaneTile(
  summary: OwnerDailyBriefingKitchenKdsSummary,
): OwnerDailyBriefingTile {
  if (summary.queueCount === 0) {
    return draftTile({
      id: BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID,
      category: "kitchen",
      label: "KDS priority lane",
      value: "No tickets",
      detail: "Kitchen display is clear — new POS orders appear here when they fire.",
      href: KDS_KITCHEN_ROUTE,
      availability: "empty",
      tone: "normal",
      priority: 1,
    });
  }

  if (summary.showPriorityLane) {
    return draftTile({
      id: BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID,
      category: "kitchen",
      label: "KDS priority lane",
      value: `${summary.priorityCandidateCount} urgent`,
      detail: priorityLaneDetail(summary),
      href: BRIEFING_KDS_PRIORITY_LANE_HREF,
      availability: "available",
      tone: "attention",
      priority: 1,
    });
  }

  return draftTile({
    id: BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID,
    category: "kitchen",
    label: "KDS priority lane",
    value: "Queue steady",
    detail: `${summary.queueCount} ticket(s) on the line — no allergy or overdue alerts right now.`,
    href: KDS_KITCHEN_ROUTE,
    availability: "available",
    tone: "success",
    priority: 1,
  });
}

export function enrichBriefingKitchenKdsPressureTile(
  tiles: readonly OwnerDailyBriefingTile[],
  summary: OwnerDailyBriefingKitchenKdsSummary,
): OwnerDailyBriefingTile[] {
  if (!summary.showPriorityLane) return [...tiles];

  return tiles.map((tile) => {
    if (tile.id !== "kds-pressure") return tile;
    return {
      ...tile,
      href: BRIEFING_KDS_PRIORITY_LANE_HREF,
      detail: `${tile.detail} Priority lane active — allergy and overdue tickets sorted first.`,
      tone: "attention" as const,
    };
  });
}

export function enrichBriefingKitchenPackTiles(
  tiles: readonly OwnerDailyBriefingTile[],
  input: OwnerDailyBriefingKitchenInput,
): OwnerDailyBriefingTile[] {
  const summary = buildBriefingKitchenKdsSummary(input.kdsOrders);
  const withoutDuplicate = tiles.filter(
    (tile) => tile.id !== BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID,
  );
  const priorityTile = buildBriefingKitchenPriorityLaneTile(summary);
  const withPressure = enrichBriefingKitchenKdsPressureTile(withoutDuplicate, summary);

  const kdsPressureIndex = withPressure.findIndex((tile) => tile.id === "kds-pressure");
  if (kdsPressureIndex >= 0) {
    const next = [...withPressure];
    next.splice(kdsPressureIndex, 0, priorityTile);
    return next;
  }

  return [priorityTile, ...withPressure];
}

export function buildOwnerDailyBriefingKitchenActions(
  input: OwnerDailyBriefingKitchenInput,
): OwnerDailyBriefingRankedAction[] {
  const summary = buildBriefingKitchenKdsSummary(input.kdsOrders);
  const actions: OwnerDailyBriefingRankedAction[] = [];

  if (summary.showPriorityLane) {
    actions.push({
      id: "kitchen-priority-lane",
      title: "Open KDS priority lane",
      reason: priorityLaneDetail(summary),
      severity: summary.allergenPrepCount > 0 ? "critical" : "high",
      ownerRole: "kitchen",
      href: BRIEFING_KDS_PRIORITY_LANE_HREF,
      status: "open",
      unblockCondition: "Bump or recall priority tickets until allergy and overdue alerts clear.",
      priority: 1,
      ctaLabel: "Open priority lane",
      tone: "urgent",
    });
  } else if (summary.queueCount > 0) {
    actions.push({
      id: "kitchen-monitor-queue",
      title: "Monitor kitchen queue",
      reason: `${summary.queueCount} ticket(s) on prep and expo — no urgent priority signals yet.`,
      severity: "normal",
      ownerRole: "kitchen",
      href: KDS_KITCHEN_ROUTE,
      status: "monitor",
      unblockCondition: "Keep prep moving before tickets hit the 15-minute overdue threshold.",
      priority: 6,
      ctaLabel: "Open kitchen",
      tone: "normal",
    });
  }

  if (input.productionCalendarOverdue > 0) {
    actions.push({
      id: "kitchen-overdue-production",
      title: "Clear overdue production batches",
      reason: `${input.productionCalendarOverdue} calendar batch(es) past due — prep gaps block fulfillment.`,
      severity: "high",
      ownerRole: "kitchen",
      href: "/dashboard/production/calendar",
      status: "open",
      unblockCondition: "Complete or reschedule overdue batches on the production calendar.",
      priority: 3,
      ctaLabel: "Open calendar",
      tone: "urgent",
    });
  }

  if (summary.queueCount === 0 && input.productionWorkOpen > 0) {
    actions.push({
      id: "kitchen-production-board",
      title: "Work production board items",
      reason: `${input.productionWorkOpen} open production item(s) — KDS is clear but prep work remains.`,
      severity: "normal",
      ownerRole: "kitchen",
      href: "/dashboard/production",
      status: "monitor",
      unblockCondition: "Close production board items before the next order wave.",
      priority: 8,
      ctaLabel: "Open production",
      tone: "normal",
    });
  }

  return actions.sort((a, b) => a.priority - b.priority);
}

export function mergeBriefingKitchenTopActions(
  kitchenActions: readonly OwnerDailyBriefingRankedAction[],
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [...kitchenActions, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

export function briefingKitchenPolicySnapshot(): {
  policyId: typeof OWNER_DAILY_BRIEFING_KITCHEN_ERA19_POLICY_ID;
  priorityLaneHref: typeof BRIEFING_KDS_PRIORITY_LANE_HREF;
} {
  return {
    policyId: OWNER_DAILY_BRIEFING_KITCHEN_ERA19_POLICY_ID,
    priorityLaneHref: BRIEFING_KDS_PRIORITY_LANE_HREF,
  };
}

export function formatBriefingKitchenPriorityReasons(
  reasons: readonly KdsPriorityReason[],
): string {
  return reasons
    .map((reason) => {
      if (reason === "allergen") return "allergy";
      if (reason === "overdue_prep") return "overdue prep";
      return "overdue expo";
    })
    .join(", ");
}

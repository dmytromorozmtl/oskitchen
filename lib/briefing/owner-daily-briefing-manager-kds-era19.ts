import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import type { OwnerDailyBriefingTile } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  buildBriefingKitchenKdsSummary,
  buildBriefingKitchenPriorityLaneTile,
  enrichBriefingKitchenKdsPressureTile,
  type OwnerDailyBriefingKitchenInput,
} from "@/lib/briefing/owner-daily-briefing-kitchen-era19";
import { BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID } from "@/lib/briefing/owner-daily-briefing-kitchen-era19";
import { OWNER_DAILY_BRIEFING_MANAGER_KDS_ERA19_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-manager-kds-era19-policy";
import { BRIEFING_KDS_PRIORITY_LANE_HREF } from "@/lib/kitchen/kds-priority-lane-era19-policy";

export const OWNER_DAILY_BRIEFING_MANAGER_KDS_AGGREGATOR_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-manager-kds-aggregator-v1" as const;

export { OWNER_DAILY_BRIEFING_MANAGER_KDS_ERA19_POLICY_ID };

export type OwnerDailyBriefingManagerKdsInput = OwnerDailyBriefingKitchenInput;

function managerPriorityLaneDetail(input: OwnerDailyBriefingManagerKdsInput): string {
  const summary = buildBriefingKitchenKdsSummary(input.kdsOrders);
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
    return `${summary.queueCount} ticket(s) on KDS — monitor line pacing before service slips.`;
  }

  return `${parts.join(" · ")} — supervisor review on the kitchen priority lane.`;
}

export function buildOwnerDailyBriefingManagerKdsActions(
  input: OwnerDailyBriefingManagerKdsInput,
): OwnerDailyBriefingRankedAction[] {
  const summary = buildBriefingKitchenKdsSummary(input.kdsOrders);
  const actions: OwnerDailyBriefingRankedAction[] = [];

  if (summary.showPriorityLane) {
    actions.push({
      id: "manager-kds-priority-lane",
      title: "Review kitchen priority lane",
      reason: managerPriorityLaneDetail(input),
      severity: summary.allergenPrepCount > 0 ? "critical" : "high",
      ownerRole: "manager",
      href: BRIEFING_KDS_PRIORITY_LANE_HREF,
      status: "open",
      unblockCondition:
        "Confirm line cooks cleared allergy and overdue tickets — recall or re-fire if expo backlog grows.",
      priority: 2,
      ctaLabel: "Open priority lane",
      tone: "urgent",
    });
  }

  if (input.packingQueueOpen > 0 && summary.showPriorityLane) {
    actions.push({
      id: "manager-packing-kds-handoff",
      title: "Align packing with KDS urgency",
      reason: `${input.packingQueueOpen} pack job(s) open while KDS has urgent tickets — coordinate expo handoff.`,
      severity: "high",
      ownerRole: "manager",
      href: "/dashboard/packing",
      status: "open",
      unblockCondition: "Expo clears ready tickets before outbound packing backlog grows.",
      priority: 4,
      ctaLabel: "Open packing",
      tone: "urgent",
    });
  }

  if (input.productionCalendarOverdue > 0) {
    actions.push({
      id: "manager-overdue-production",
      title: "Escalate overdue production batches",
      reason: `${input.productionCalendarOverdue} calendar batch(es) past due — prep gaps affect ticket times.`,
      severity: "high",
      ownerRole: "manager",
      href: "/dashboard/production/calendar",
      status: "open",
      unblockCondition: "Reschedule or complete overdue batches before rush-hour intake.",
      priority: 3,
      ctaLabel: "Open calendar",
      tone: "urgent",
    });
  }

  if (summary.queueCount === 0 && input.productionWorkOpen > 0) {
    actions.push({
      id: "manager-production-backlog",
      title: "Clear production board backlog",
      reason: `${input.productionWorkOpen} open production item(s) while KDS is clear — prep before the next wave.`,
      severity: "normal",
      ownerRole: "manager",
      href: "/dashboard/production",
      status: "monitor",
      unblockCondition: "Close production board items before ticket pressure returns.",
      priority: 9,
      ctaLabel: "Open production",
      tone: "normal",
    });
  }

  return actions.sort((a, b) => a.priority - b.priority);
}

export function enrichBriefingManagerPackTiles(
  tiles: readonly OwnerDailyBriefingTile[],
  input: OwnerDailyBriefingManagerKdsInput,
): OwnerDailyBriefingTile[] {
  const summary = buildBriefingKitchenKdsSummary(input.kdsOrders);
  const withoutDuplicate = tiles.filter(
    (tile) => tile.id !== BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID,
  );

  let enriched = enrichBriefingKitchenKdsPressureTile(withoutDuplicate, summary);

  if (summary.showPriorityLane) {
    const priorityTile = buildBriefingKitchenPriorityLaneTile(summary);
    const kdsPressureIndex = enriched.findIndex((tile) => tile.id === "kds-pressure");
    if (kdsPressureIndex >= 0) {
      const next = [...enriched];
      next.splice(kdsPressureIndex, 0, {
        ...priorityTile,
        detail: managerPriorityLaneDetail(input),
      });
      enriched = next;
    } else {
      enriched = [priorityTile, ...enriched];
    }
  }

  return enriched;
}

export function mergeBriefingManagerKdsTopActions(
  managerActions: readonly OwnerDailyBriefingRankedAction[],
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [...managerActions, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

export function briefingManagerKdsPolicySnapshot(): {
  policyId: typeof OWNER_DAILY_BRIEFING_MANAGER_KDS_ERA19_POLICY_ID;
  priorityLaneHref: typeof BRIEFING_KDS_PRIORITY_LANE_HREF;
} {
  return {
    policyId: OWNER_DAILY_BRIEFING_MANAGER_KDS_ERA19_POLICY_ID,
    priorityLaneHref: BRIEFING_KDS_PRIORITY_LANE_HREF,
  };
}

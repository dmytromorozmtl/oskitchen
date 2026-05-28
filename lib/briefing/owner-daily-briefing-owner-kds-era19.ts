import type {
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
} from "@/lib/briefing/owner-daily-briefing-era19";
import {
  buildBriefingKitchenKdsSummary,
  buildBriefingKitchenPriorityLaneTile,
  type OwnerDailyBriefingKitchenInput,
} from "@/lib/briefing/owner-daily-briefing-kitchen-era19";
import { BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID } from "@/lib/briefing/owner-daily-briefing-kitchen-era19";
import { OWNER_DAILY_BRIEFING_OWNER_KDS_ERA19_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-owner-kds-era19-policy";
import { BRIEFING_KDS_PRIORITY_LANE_HREF } from "@/lib/kitchen/kds-priority-lane-era19-policy";

export const OWNER_DAILY_BRIEFING_OWNER_KDS_AGGREGATOR_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-owner-kds-aggregator-v1" as const;

export { OWNER_DAILY_BRIEFING_OWNER_KDS_ERA19_POLICY_ID };

export type OwnerDailyBriefingOwnerKdsInput = OwnerDailyBriefingKitchenInput;

function ownerPriorityLaneDetail(input: OwnerDailyBriefingOwnerKdsInput): string {
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
    return `${summary.queueCount} ticket(s) on KDS during pilot service — verify line pacing.`;
  }

  return `${parts.join(" · ")} — owner review on the kitchen priority lane before guest impact.`;
}

export function buildOwnerDailyBriefingOwnerKdsActions(
  input: OwnerDailyBriefingOwnerKdsInput,
): OwnerDailyBriefingRankedAction[] {
  const summary = buildBriefingKitchenKdsSummary(input.kdsOrders);
  if (!summary.showPriorityLane) return [];

  return [
    {
      id: "owner-kds-priority-lane",
      title: "Review kitchen priority lane",
      reason: ownerPriorityLaneDetail(input),
      severity: summary.allergenPrepCount > 0 ? "critical" : "high",
      ownerRole: "owner",
      href: BRIEFING_KDS_PRIORITY_LANE_HREF,
      status: "open",
      unblockCondition:
        "Line clears allergy and overdue tickets — pilot service quality depends on kitchen handoffs.",
      priority: 5,
      ctaLabel: "Open priority lane",
      tone: "urgent",
    },
  ];
}

export function enrichBriefingOwnerPackTiles(
  tiles: readonly OwnerDailyBriefingTile[],
  input: OwnerDailyBriefingOwnerKdsInput,
): OwnerDailyBriefingTile[] {
  const summary = buildBriefingKitchenKdsSummary(input.kdsOrders);
  if (!summary.showPriorityLane) return [...tiles];

  const withoutDuplicate = tiles.filter(
    (tile) => tile.id !== BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID,
  );
  const priorityTile = {
    ...buildBriefingKitchenPriorityLaneTile(summary),
    detail: ownerPriorityLaneDetail(input),
  };

  const stuckOrdersIndex = withoutDuplicate.findIndex((tile) => tile.id === "stuck-orders");
  if (stuckOrdersIndex >= 0) {
    const next = [...withoutDuplicate];
    next.splice(stuckOrdersIndex, 0, priorityTile);
    return next;
  }

  return [priorityTile, ...withoutDuplicate];
}

export function mergeBriefingOwnerKdsTopActions(
  ownerKdsActions: readonly OwnerDailyBriefingRankedAction[],
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [...generalActions, ...ownerKdsActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

export function briefingOwnerKdsPolicySnapshot(): {
  policyId: typeof OWNER_DAILY_BRIEFING_OWNER_KDS_ERA19_POLICY_ID;
  priorityLaneHref: typeof BRIEFING_KDS_PRIORITY_LANE_HREF;
} {
  return {
    policyId: OWNER_DAILY_BRIEFING_OWNER_KDS_ERA19_POLICY_ID,
    priorityLaneHref: BRIEFING_KDS_PRIORITY_LANE_HREF,
  };
}

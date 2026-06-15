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
  buildBriefingKitchenKdsSummary,
  type OwnerDailyBriefingKitchenInput,
} from "@/lib/briefing/owner-daily-briefing-kitchen-era19";
import {
  BRIEFING_KITCHEN_PACKING_QC_HREF,
  shouldBriefingKitchenPackingQcHandoff,
} from "@/lib/briefing/owner-daily-briefing-kitchen-packing-qc-era19";
import {
  BRIEFING_MANAGER_PACKING_QC_TILE_ID,
  OWNER_DAILY_BRIEFING_MANAGER_PACKING_QC_ERA19_POLICY_ID,
} from "@/lib/briefing/owner-daily-briefing-manager-packing-qc-era19-policy";
import { PACKING_QC_CLARITY_ANCHOR } from "@/lib/packing/packing-qc-clarity-era19-policy";

export const OWNER_DAILY_BRIEFING_MANAGER_PACKING_QC_AGGREGATOR_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-manager-packing-qc-aggregator-v1" as const;

export {
  BRIEFING_MANAGER_PACKING_QC_TILE_ID,
  OWNER_DAILY_BRIEFING_MANAGER_PACKING_QC_ERA19_POLICY_ID,
};

export const BRIEFING_MANAGER_PACKING_QC_HREF = BRIEFING_KITCHEN_PACKING_QC_HREF;

function draftTile(tile: OwnerDailyBriefingTileDraft): OwnerDailyBriefingTile {
  return enrichBriefingTilesLinks([tile])[0]!;
}

export function resolveBriefingManagerPackingQcLinkState(input: {
  packingQueueOpen: number;
  showPriorityLane: boolean;
}): BriefingTileLinkState {
  if (input.packingQueueOpen === 0) return "empty";
  return shouldBriefingKitchenPackingQcHandoff(input) ? "operational" : "operational";
}

export function buildBriefingManagerPackingQcTile(
  input: OwnerDailyBriefingKitchenInput,
): OwnerDailyBriefingTile | null {
  const summary = buildBriefingKitchenKdsSummary(input.kdsOrders);
  if (
    !shouldBriefingKitchenPackingQcHandoff({
      packingQueueOpen: input.packingQueueOpen,
      showPriorityLane: summary.showPriorityLane,
    })
  ) {
    return null;
  }

  const allergenNote =
    summary.allergenPrepCount > 0
      ? `${summary.allergenPrepCount} allergy alert${summary.allergenPrepCount === 1 ? "" : "s"} on KDS — `
      : "";

  return draftTile({
    id: BRIEFING_MANAGER_PACKING_QC_TILE_ID,
    category: "packing",
    label: "Packing QC supervision",
    value: `${input.packingQueueOpen} open`,
    detail: `${allergenNote}${input.packingQueueOpen} pack job(s) while KDS priority lane is active — supervise the 4-step QC checklist before handoff.`,
    href: BRIEFING_MANAGER_PACKING_QC_HREF,
    availability: "available",
    tone: "attention",
    priority: 3,
  });
}

export function enrichBriefingManagerPackingQcPackTiles(
  tiles: readonly OwnerDailyBriefingTile[],
  input: OwnerDailyBriefingKitchenInput,
): OwnerDailyBriefingTile[] {
  const handoffTile = buildBriefingManagerPackingQcTile(input);
  const summary = buildBriefingKitchenKdsSummary(input.kdsOrders);

  let next = tiles.filter((tile) => tile.id !== BRIEFING_MANAGER_PACKING_QC_TILE_ID);

  if (handoffTile) {
    const priorityLaneIndex = next.findIndex((tile) => tile.id === "kds-priority-lane");
    if (priorityLaneIndex >= 0) {
      const withHandoff = [...next];
      withHandoff.splice(priorityLaneIndex + 1, 0, handoffTile);
      next = withHandoff;
    } else {
      next = [handoffTile, ...next];
    }
  }

  if (
    shouldBriefingKitchenPackingQcHandoff({
      packingQueueOpen: input.packingQueueOpen,
      showPriorityLane: summary.showPriorityLane,
    })
  ) {
    return next.map((tile) => {
      if (tile.id !== "packing-status") return tile;
      return {
        ...tile,
        href: BRIEFING_MANAGER_PACKING_QC_HREF,
        detail: `${tile.detail} KDS priority active — supervisor review on packing QC checklist.`,
        tone: "attention" as const,
      };
    });
  }

  return next;
}

export function buildOwnerDailyBriefingManagerPackingQcActions(
  input: OwnerDailyBriefingKitchenInput,
): OwnerDailyBriefingRankedAction[] {
  const summary = buildBriefingKitchenKdsSummary(input.kdsOrders);
  if (
    !shouldBriefingKitchenPackingQcHandoff({
      packingQueueOpen: input.packingQueueOpen,
      showPriorityLane: summary.showPriorityLane,
    })
  ) {
    return [];
  }

  const allergenNote =
    summary.allergenPrepCount > 0
      ? ` Allergy alerts on KDS — confirm allergen QC before labels or handoff.`
      : "";

  return [
    {
      id: "manager-packing-kds-handoff",
      title: "Supervise packing QC checklist",
      reason: `${input.packingQueueOpen} pack job(s) open while KDS priority lane is active — coordinate expo pickup with the 4-step QC flow.${allergenNote}`,
      severity: summary.allergenPrepCount > 0 ? "critical" : "high",
      ownerRole: "manager",
      href: BRIEFING_MANAGER_PACKING_QC_HREF,
      status: "open",
      unblockCondition:
        "Expo clears ready tickets and packing QC checklist shows allergen, label, and verify steps complete.",
      priority: 4,
      ctaLabel: "Open QC checklist",
      tone: "urgent",
    },
  ];
}

export function mergeBriefingManagerPackingQcActions(
  managerActions: readonly OwnerDailyBriefingRankedAction[],
  packingQcActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  const withoutDuplicate = managerActions.filter(
    (action) => action.id !== "manager-packing-kds-handoff",
  );
  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [...withoutDuplicate, ...packingQcActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

export function briefingManagerPackingQcPolicySnapshot(): {
  policyId: typeof OWNER_DAILY_BRIEFING_MANAGER_PACKING_QC_ERA19_POLICY_ID;
  qcHref: typeof BRIEFING_MANAGER_PACKING_QC_HREF;
  qcAnchor: typeof PACKING_QC_CLARITY_ANCHOR;
} {
  return {
    policyId: OWNER_DAILY_BRIEFING_MANAGER_PACKING_QC_ERA19_POLICY_ID,
    qcHref: BRIEFING_MANAGER_PACKING_QC_HREF,
    qcAnchor: PACKING_QC_CLARITY_ANCHOR,
  };
}

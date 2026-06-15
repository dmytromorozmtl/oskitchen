import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatContinuousImprovementLoopTrackDetail,
  resolveNextContinuousImprovementLoopAttentionTrack,
} from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import {
  formatContinuousImprovementLoopProgressLabel,
  type ContinuousImprovementLoopUiSlice,
} from "@/lib/commercial/continuous-improvement-loop-ui-era22";

export const OWNER_DAILY_BRIEFING_CONTINUOUS_IMPROVEMENT_LOOP_ERA34_POLICY_ID =
  "era34-owner-daily-briefing-continuous-improvement-loop-v1" as const;

export const CONTINUOUS_IMPROVEMENT_LOOP_BRIEFING_ACTION_PRIORITY = 9 as const;

export function buildOwnerDailyBriefingContinuousImprovementLoopAction(
  slice: ContinuousImprovementLoopUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const nextTrack = resolveNextContinuousImprovementLoopAttentionTrack(slice.tracks);
  const trackDetail = nextTrack
    ? formatContinuousImprovementLoopTrackDetail(nextTrack)
    : formatContinuousImprovementLoopProgressLabel(slice);

  const href =
    nextTrack?.id === "weekly_integration"
      ? slice.integrationHealthHref
      : nextTrack?.id === "monthly_metrics"
        ? slice.reportsHref
        : nextTrack?.id === "quarterly_governance"
          ? slice.platformOpsHref
          : nextTrack?.id === "daily_shift_ops"
            ? slice.orderHubHref
            : slice.todayHref;

  return {
    id: "continuous-improvement-loop",
    title: nextTrack
      ? `Improvement loop — ${nextTrack.label.replace(/^(Daily|Weekly|Monthly|Quarterly|Per release|Per new pilot) — /, "")}`
      : "Continuous improvement loop — pure operational mode",
    reason: `${formatContinuousImprovementLoopProgressLabel(slice)}. ${trackDetail}`,
    severity: slice.overdueCount > 0 ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Maintain recurring improvement tracks with honest artifact freshness — never hand-edit PASS in artifacts.",
    priority: CONTINUOUS_IMPROVEMENT_LOOP_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open improvement loop",
    tone: slice.overdueCount > 0 ? "urgent" : "normal",
  };
}

export function mergeBriefingContinuousImprovementLoopTopActions(
  improvementLoopAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!improvementLoopAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [improvementLoopAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

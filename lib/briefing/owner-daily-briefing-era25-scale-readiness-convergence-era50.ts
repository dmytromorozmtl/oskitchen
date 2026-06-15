import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatScaleReadinessConvergenceEra25Label,
  type ScaleReadinessConvergenceEra25UiSlice,
} from "@/lib/commercial/scale-readiness-convergence-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_SCALE_READINESS_CONVERGENCE_ERA50_POLICY_ID =
  "era50-owner-daily-briefing-era25-scale-readiness-convergence-v1" as const;

export const SCALE_READINESS_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY = 25 as const;

export function buildOwnerDailyBriefingEra25ScaleReadinessConvergenceAction(
  slice: ScaleReadinessConvergenceEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked =
    slice.convergenceBlocked ||
    slice.scaleReadinessConvergenceEra25Milestone !== "scale_readiness_convergence_era25_ready";
  const href = slice.platformOpsHref;

  return {
    id: "era25-scale-readiness-convergence",
    title: blocked
      ? `Scale blocked: ${slice.scaleReadinessConvergenceEra25Milestone.replaceAll("_", " ")}`
      : `Era25 scale — ${slice.completedBlockingCount}/${slice.totalBlockingCount} gates ready`,
    reason: `${formatScaleReadinessConvergenceEra25Label(slice)}. ${blocked ? "Complete month 2 market readiness convergence, then execute gates 1–5 with honest SCALE_* env before era25 Series A partner expansion convergence." : "Scale convergence ready — proceed to Series A / partner expansion on #era25-series-a-partner-expansion-convergence."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete scale convergence with honest month 2 integrity — never hand-edit PASS in artifacts.",
    priority: SCALE_READINESS_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: "Open Scale convergence",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25ScaleReadinessConvergenceTopActions(
  scaleReadinessConvergenceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!scaleReadinessConvergenceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [scaleReadinessConvergenceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

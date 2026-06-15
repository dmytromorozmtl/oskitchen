import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatSustainedOperationalExcellenceConvergenceEra25Label,
  type SustainedOperationalExcellenceConvergenceEra25UiSlice,
} from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA53_POLICY_ID =
  "era53-owner-daily-briefing-era25-sustained-operational-excellence-convergence-v1" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY = 28 as const;

export function buildOwnerDailyBriefingEra25SustainedOperationalExcellenceConvergenceAction(
  slice: SustainedOperationalExcellenceConvergenceEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked =
    slice.convergenceBlocked ||
    slice.sustainedOperationalExcellenceConvergenceEra25Milestone !==
      "sustained_operational_excellence_convergence_era25_ready";
  const href = slice.platformOpsHref;

  return {
    id: "era25-sustained-operational-excellence-convergence",
    title: blocked
      ? `Sustained ops blocked: ${slice.sustainedOperationalExcellenceConvergenceEra25Milestone.replaceAll("_", " ")}`
      : `Era25 sustained ops — ${slice.completedBlockingCount}/${slice.totalBlockingCount} cadences ready`,
    reason: `${formatSustainedOperationalExcellenceConvergenceEra25Label(slice)}. ${blocked ? "Complete market leader positioning convergence, then execute cadences A–D with honest SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_* env before era25 pure operational mode terminus." : "Sustained ops convergence ready — proceed to pure operational mode on #era25-pure-operational-mode-terminus."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete sustained ops convergence with honest market leader integrity — never hand-edit PASS in artifacts.",
    priority: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: "Open sustained ops convergence",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25SustainedOperationalExcellenceConvergenceTopActions(
  sustainedOperationalExcellenceConvergenceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!sustainedOperationalExcellenceConvergenceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [sustainedOperationalExcellenceConvergenceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

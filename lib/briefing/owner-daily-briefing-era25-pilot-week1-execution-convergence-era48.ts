import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatPilotWeek1ExecutionConvergenceEra25Label,
  type PilotWeek1ExecutionConvergenceEra25UiSlice,
} from "@/lib/commercial/pilot-week1-execution-convergence-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA48_POLICY_ID =
  "era48-owner-daily-briefing-era25-pilot-week1-execution-convergence-v1" as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY = 23 as const;

export function buildOwnerDailyBriefingEra25PilotWeek1ExecutionConvergenceAction(
  slice: PilotWeek1ExecutionConvergenceEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked =
    slice.convergenceBlocked ||
    slice.pilotWeek1ExecutionConvergenceEra25Milestone !==
      "pilot_week1_execution_convergence_era25_ready";
  const href = slice.platformOpsHref;

  return {
    id: "era25-pilot-week1-execution-convergence",
    title: blocked
      ? `Week 1 blocked: ${slice.pilotWeek1ExecutionConvergenceEra25Milestone.replaceAll("_", " ")}`
      : `Era25 pilot week 1 — ${slice.completedPhaseCount}/${slice.totalPhaseCount} days ready`,
    reason: `${formatPilotWeek1ExecutionConvergenceEra25Label(slice)}. ${blocked ? "Complete paid pilot GO convergence, then execute Days 1–5 with honest PILOT_WEEK1_* env before era25 month2 convergence." : "Week 1 convergence ready — proceed to month 2 market readiness on #era25-month2-market-readiness-convergence."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete week 1 convergence with honest GO convergence integrity — never hand-edit PASS in artifacts.",
    priority: PILOT_WEEK1_EXECUTION_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: "Open Week 1 convergence",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25PilotWeek1ExecutionConvergenceTopActions(
  pilotWeek1ExecutionConvergenceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!pilotWeek1ExecutionConvergenceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [pilotWeek1ExecutionConvergenceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

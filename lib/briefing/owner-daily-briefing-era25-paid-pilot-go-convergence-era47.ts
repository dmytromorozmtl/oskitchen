import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatPaidPilotGoConvergenceEra25Label,
  type PaidPilotGoConvergenceEra25UiSlice,
} from "@/lib/commercial/paid-pilot-go-convergence-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_PAID_PILOT_GO_CONVERGENCE_ERA47_POLICY_ID =
  "era47-owner-daily-briefing-era25-paid-pilot-go-convergence-v1" as const;

export const PAID_PILOT_GO_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY = 22 as const;

export function buildOwnerDailyBriefingEra25PaidPilotGoConvergenceAction(
  slice: PaidPilotGoConvergenceEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked =
    slice.convergenceBlocked ||
    slice.paidPilotGoConvergenceEra25Milestone !== "paid_pilot_go_convergence_era25_ready";
  const href = slice.platformOpsHref;

  return {
    id: "era25-paid-pilot-go-convergence",
    title: blocked
      ? `GO convergence blocked: ${slice.paidPilotGoConvergenceEra25Milestone.replaceAll("_", " ")}`
      : `Era25 paid pilot GO convergence — ${slice.goDecision ?? "GO"} ready`,
    reason: `${formatPaidPilotGoConvergenceEra25Label(slice)}. ${blocked ? "Complete breakthrough B0–B4, qualify ICP, record LOI, pass forbidden-claims smoke, and sync kickoff checklist before era25 week1 convergence." : "GO convergence ready — proceed to pilot week1 execution convergence on dedicated #era25-* anchors."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete GO convergence with honest breakthrough integrity — never hand-edit PASS in artifacts.",
    priority: PAID_PILOT_GO_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: "Open GO convergence",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25PaidPilotGoConvergenceTopActions(
  paidPilotGoConvergenceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!paidPilotGoConvergenceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [paidPilotGoConvergenceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

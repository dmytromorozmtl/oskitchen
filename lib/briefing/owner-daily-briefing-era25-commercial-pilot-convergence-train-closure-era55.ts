import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25CommercialPilotConvergenceTrainClosureEra25Label,
  type Era25CommercialPilotConvergenceTrainClosureEra25UiSlice,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ERA55_POLICY_ID =
  "era55-owner-daily-briefing-era25-commercial-pilot-convergence-train-closure-v1" as const;

export const COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_BRIEFING_META_ACTION_PRIORITY = 30 as const;

export function buildOwnerDailyBriefingEra25CommercialPilotConvergenceTrainClosureAction(
  slice: Era25CommercialPilotConvergenceTrainClosureEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.trainClosureBlocked;
  const href = slice.platformOpsHref;

  return {
    id: "era25-commercial-pilot-convergence-train-closure",
    title: blocked
      ? `Convergence train blocked: ${slice.convergenceIntegrityBaselinesHonestCount}/${slice.convergenceIntegrityBaselinesTotalCount} baselines`
      : `Era25 convergence train closed · ${slice.convergenceIntegrityBaselinesHonestCount}/${slice.convergenceIntegrityBaselinesTotalCount} baselines`,
    reason: `${formatEra25CommercialPilotConvergenceTrainClosureEra25Label(slice)}. ${blocked ? "Sync era47–era54 convergence integrity baselines, attest pure ops terminus, then run train closure validate + commercial-pilot-runbook cert." : "Train closure honest — maintain improvement loop only; era25 convergence surfaces stay suppressed in pure operational mode."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Close era25 commercial pilot convergence train with honest era47–era54 baselines and pure ops terminus integrity PASS.",
    priority: COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: "Open train closure rollup",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25CommercialPilotConvergenceTrainClosureTopActions(
  commercialPilotConvergenceTrainClosureAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!commercialPilotConvergenceTrainClosureAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [commercialPilotConvergenceTrainClosureAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

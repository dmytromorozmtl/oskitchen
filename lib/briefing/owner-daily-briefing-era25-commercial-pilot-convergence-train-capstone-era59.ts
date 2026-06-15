import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25CommercialPilotConvergenceTrainCapstoneEra25Label,
  type Era25CommercialPilotConvergenceTrainCapstoneEra25UiSlice,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-capstone-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ERA59_POLICY_ID =
  "era59-owner-daily-briefing-era25-commercial-pilot-convergence-train-capstone-v1" as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_BRIEFING_META_ACTION_PRIORITY = 34 as const;

export function buildOwnerDailyBriefingEra25CommercialPilotConvergenceTrainCapstoneAction(
  slice: Era25CommercialPilotConvergenceTrainCapstoneEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.trainCapstoneBlocked;
  const href = slice.platformOpsHref;

  return {
    id: "era25-commercial-pilot-convergence-train-capstone",
    title: blocked
      ? slice.frozenEnvMutationDetected
        ? "Train capstone blocked: era25 env keys still mutable"
        : slice.p0ProofReferencedInCapstone && slice.p0ProofStatus !== "proof_passed"
          ? "Train capstone blocked: P0 proof_passed not honest in artifact"
          : "Commercial pilot convergence train capstone: attest after steady-state lock"
      : "Era25 convergence train capstone closed · execute P0 ops vault in parallel",
    reason: `${formatEra25CommercialPilotConvergenceTrainCapstoneEra25Label(slice)}. ${blocked ? "Complete steady-state lock (era58), validate capstone + P0 artifact honesty, then dual-cert governance-bundles + commercial-pilot-runbook. Capstone does not substitute for ops vault proof_passed." : "Governance train era47–AH honestly closed — sustain Band A P0 execution via smoke:p0-staging-proof-unblock."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Attest era25 commercial pilot convergence train capstone after honest steady-state lock with honest P0/GO artifact references (never fake proof_passed).",
    priority: ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: "Open train capstone",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25CommercialPilotConvergenceTrainCapstoneTopActions(
  capstoneAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!capstoneAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [capstoneAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

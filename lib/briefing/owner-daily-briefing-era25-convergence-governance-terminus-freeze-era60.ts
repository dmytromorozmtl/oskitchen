import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25ConvergenceGovernanceTerminusFreezeEra25Label,
  type Era25ConvergenceGovernanceTerminusFreezeEra25UiSlice,
} from "@/lib/commercial/era25-convergence-governance-terminus-freeze-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ERA60_POLICY_ID =
  "era60-owner-daily-briefing-era25-convergence-governance-terminus-freeze-v1" as const;

export const ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_BRIEFING_META_ACTION_PRIORITY = 35 as const;

export function buildOwnerDailyBriefingEra25ConvergenceGovernanceTerminusFreezeAction(
  slice: Era25ConvergenceGovernanceTerminusFreezeEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.terminusFreezeBlocked;
  const href = slice.platformOpsHref;

  return {
    id: "era25-convergence-governance-terminus-freeze",
    title: blocked
      ? slice.frozenEnvMutationDetected
        ? "Governance terminus freeze blocked: era25 env keys still mutable"
        : slice.marketProofReferencedInTerminusFreeze && slice.p0ProofStatus !== "proof_passed"
          ? "Governance terminus freeze blocked: market proof not honest in P0 artifact"
          : "Convergence governance terminus freeze: attest after train capstone"
      : "Era25 governance terminus frozen · execute P0 ops vault for market proof",
    reason: `${formatEra25ConvergenceGovernanceTerminusFreezeEra25Label(slice)}. ${blocked ? "Complete train capstone (era59), validate terminus freeze + P0 artifact honesty, then dual-cert. Freeze does not fake proof_passed." : "Era25 product convergence strips suppressed — sustain improvement loop + Band A P0 via ops vault and smoke:p0-staging-proof-unblock."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Freeze era25 convergence governance env after honest train capstone; reference P0 artifact honestly; suppress era25 convergence UI until next major policy version.",
    priority: ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: "Open governance terminus freeze",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25ConvergenceGovernanceTerminusFreezeTopActions(
  terminusFreezeAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!terminusFreezeAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [terminusFreezeAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

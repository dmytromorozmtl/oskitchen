import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25PostBandAGovernanceSteadyProductModeWitnessEra25Label,
  type Era25PostBandAGovernanceSteadyProductModeWitnessEra25UiSlice,
} from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA67_POLICY_ID =
  "era67-owner-daily-briefing-era25-post-band-a-governance-steady-product-mode-witness-v1" as const;

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_BRIEFING_META_ACTION_PRIORITY =
  42 as const;

export function buildOwnerDailyBriefingEra25PostBandAGovernanceSteadyProductModeWitnessAction(
  slice: Era25PostBandAGovernanceSteadyProductModeWitnessEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.steadyProductModeWitnessBlocked;
  const href = slice.platformOpsHref;

  return {
    id: "era25-post-band-a-governance-steady-product-mode-witness",
    title: blocked
      ? slice.governanceReopenClaimed
        ? "Steady product mode witness blocked: era25 governance reopen env detected"
        : !slice.continuousImprovementLoopIntegrityPassed
          ? "Steady product mode witness blocked: improvement loop integrity FAIL"
          : !slice.bandAGovernanceChainCapstoneWitnessActive
            ? "Steady product mode witness: complete Band A capstone witness first"
            : "Steady product mode witness: attest after capstone + improvement loop PASS"
      : "Era25 post-governance steady product mode witness active",
    reason: `${formatEra25PostBandAGovernanceSteadyProductModeWitnessEra25Label(slice)}. ${blocked ? "After Band A capstone witness, attest steady product mode witness only when improvement loop integrity PASS and era25 frozen governance env stays clear — sustain honest GO/commercial artifacts with zero era25 env mutation forever." : "Sustain honest commercial pilot artifact rhythm and improvement loop; era25 governance chain remains permanently witnessed closed."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Attest ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_* only when Band A capstone witness is active, governance chain closed, and continuous improvement loop integrity PASS.",
    priority: ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: blocked ? "Open steady product mode" : "View steady product mode",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25PostBandAGovernanceSteadyProductModeWitnessTopActions(
  steadyProductModeWitnessAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!steadyProductModeWitnessAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [steadyProductModeWitnessAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

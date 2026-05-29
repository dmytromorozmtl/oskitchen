import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25PostMarketProofSteadyOperationalWitnessEra25Label,
  type Era25PostMarketProofSteadyOperationalWitnessEra25UiSlice,
} from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA63_POLICY_ID =
  "era63-owner-daily-briefing-era25-post-market-proof-steady-operational-witness-v1" as const;

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_BRIEFING_META_ACTION_PRIORITY = 38 as const;

export function buildOwnerDailyBriefingEra25PostMarketProofSteadyOperationalWitnessAction(
  slice: Era25PostMarketProofSteadyOperationalWitnessEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.witnessBlocked;
  const href = slice.improvementLoopHref;

  return {
    id: "era25-post-market-proof-steady-operational-witness",
    title: blocked
      ? slice.governanceReopenClaimed
        ? "Steady ops witness blocked: era25 governance reopen env detected"
        : !slice.continuousImprovementLoopIntegrityPassed
          ? "Steady ops witness blocked: improvement loop integrity FAIL"
          : !slice.era25MarketProofGovernanceChainClosed
            ? "Post-market steady ops witness: complete P0 closure capstone first"
            : "Post-market steady ops witness: attest after closure capstone + improvement loop PASS"
      : "Era25 post-market steady ops witness active · governance frozen",
    reason: `${formatEra25PostMarketProofSteadyOperationalWitnessEra25Label(slice)}. ${blocked ? "After honest P0 closure capstone, attest steady operational witness only when improvement loop integrity PASS and era25 convergence env stays frozen — never reopen era47–AL governance train." : "Sustain improvement loop rhythm and commercial ops on honest artifacts only; era25 market-proof governance chain remains closed."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Attest ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_* only when P0 closure capstone integrity PASS, governance chain closed, and continuous improvement loop integrity PASS.",
    priority: ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: blocked ? "Open improvement loop" : "View steady ops witness",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25PostMarketProofSteadyOperationalWitnessTopActions(
  witnessAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!witnessAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [witnessAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

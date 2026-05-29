import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25BandAGovernanceChainCapstoneWitnessEra25Label,
  type Era25BandAGovernanceChainCapstoneWitnessEra25UiSlice,
} from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA66_POLICY_ID =
  "era66-owner-daily-briefing-era25-band-a-governance-chain-capstone-witness-v1" as const;

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_BRIEFING_META_ACTION_PRIORITY = 41 as const;

export function buildOwnerDailyBriefingEra25BandAGovernanceChainCapstoneWitnessAction(
  slice: Era25BandAGovernanceChainCapstoneWitnessEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.capstoneWitnessBlocked;
  const href = slice.platformOpsHref;

  return {
    id: "era25-band-a-governance-chain-capstone-witness",
    title: blocked
      ? slice.governanceReopenClaimed
        ? "Band A capstone witness blocked: era25 governance reopen env detected"
        : !slice.continuousImprovementLoopIntegrityPassed
          ? "Band A capstone witness blocked: improvement loop integrity FAIL"
          : !slice.postTerminalSealCommercialOpsPermanenceActive
            ? "Band A capstone witness: complete commercial ops permanence first"
            : "Band A capstone witness: attest after permanence + improvement loop PASS"
      : "Era25 Band A governance chain capstone witness active",
    reason: `${formatEra25BandAGovernanceChainCapstoneWitnessEra25Label(slice)}. ${blocked ? "After commercial ops permanence, attest Band A governance chain capstone witness only when era61–AO stack is honestly closed and frozen governance env stays clear — sustain honest GO/commercial artifacts without reopening era25 convergence train." : "Sustain honest commercial pilot artifact rhythm and improvement loop; era25 Band A governance chain remains permanently witnessed closed."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Attest ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_* only when commercial ops permanence is active, governance chain closed, and continuous improvement loop integrity PASS.",
    priority: ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: blocked ? "Open capstone witness" : "View capstone witness",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25BandAGovernanceChainCapstoneWitnessTopActions(
  capstoneWitnessAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!capstoneWitnessAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [capstoneWitnessAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

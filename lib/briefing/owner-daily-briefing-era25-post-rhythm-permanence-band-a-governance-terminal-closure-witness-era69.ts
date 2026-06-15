import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessEra25Label,
  type Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessEra25UiSlice,
} from "@/lib/commercial/era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ERA69_POLICY_ID =
  "era69-owner-daily-briefing-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-v1" as const;

export const ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_BRIEFING_META_ACTION_PRIORITY =
  44 as const;

export function buildOwnerDailyBriefingEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessAction(
  slice: Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.terminalClosureWitnessBlocked;
  const href = slice.commercialOpsHref;

  return {
    id: "era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness",
    title: blocked
      ? slice.governanceReopenClaimed
        ? "Band A terminal closure witness blocked: era25 governance reopen env detected"
        : !slice.continuousImprovementLoopIntegrityPassed
          ? "Band A terminal closure witness blocked: improvement loop integrity FAIL"
          : !slice.postSteadyProductModeCommercialOpsRhythmPermanenceActive
            ? "Band A terminal closure witness: complete commercial ops rhythm permanence first"
            : "Band A terminal closure witness: attest after rhythm permanence + improvement loop PASS"
      : "Era25 Band A governance terminal closure witness active",
    reason: `${formatEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessEra25Label(slice)}. ${blocked ? "After commercial ops rhythm permanence, attest Band A governance terminal closure witness only when improvement loop integrity PASS and era25 frozen governance env stays clear — era61–AR stack must remain permanently closed." : "Sustain honest commercial pilot artifact rhythm and improvement loop; era25 Band A governance chain is permanently closed."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Attest ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_* only when rhythm permanence is active, governance chain closed, and continuous improvement loop integrity PASS.",
    priority:
      ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: blocked ? "Open commercial ops" : "View terminal closure witness",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessTopActions(
  terminalClosureWitnessAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!terminalClosureWitnessAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [terminalClosureWitnessAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

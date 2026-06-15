import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25GovernanceTrainTerminalSealEra25Label,
  type Era25GovernanceTrainTerminalSealEra25UiSlice,
} from "@/lib/commercial/era25-governance-train-terminal-seal-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA64_POLICY_ID =
  "era64-owner-daily-briefing-era25-governance-train-terminal-seal-v1" as const;

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_BRIEFING_META_ACTION_PRIORITY = 39 as const;

export function buildOwnerDailyBriefingEra25GovernanceTrainTerminalSealAction(
  slice: Era25GovernanceTrainTerminalSealEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.sealBlocked;
  const href = slice.improvementLoopHref;

  return {
    id: "era25-governance-train-terminal-seal",
    title: blocked
      ? slice.governanceReopenClaimed
        ? "Governance train seal blocked: era25 governance reopen env detected"
        : !slice.continuousImprovementLoopIntegrityPassed
          ? "Governance train seal blocked: improvement loop integrity FAIL"
          : !slice.postMarketProofSteadyOpsWitnessActive
            ? "Terminal seal: complete post-market steady ops witness first"
            : "Governance train terminal seal: attest after steady witness + improvement loop PASS"
      : "Era25 governance train terminal seal active · era47–AM train closed",
    reason: `${formatEra25GovernanceTrainTerminalSealEra25Label(slice)}. ${blocked ? "After honest post-market steady ops witness, attest terminal seal only when improvement loop integrity PASS and all era25 frozen governance env stays clear — never reopen era47–AM convergence train." : "Era25 commercial-pilot convergence governance train is permanently sealed — sustain improvement loop and honest commercial artifacts only."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Attest ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_* only when post-market steady ops witness is active, governance chain closed, and continuous improvement loop integrity PASS.",
    priority: ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: blocked ? "Open improvement loop" : "View terminal seal",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25GovernanceTrainTerminalSealTopActions(
  sealAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!sealAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [sealAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

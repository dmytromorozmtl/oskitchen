import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25PostTerminalSealCommercialOpsPermanenceEra25Label,
  type Era25PostTerminalSealCommercialOpsPermanenceEra25UiSlice,
} from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA65_POLICY_ID =
  "era65-owner-daily-briefing-era25-post-terminal-seal-commercial-ops-permanence-v1" as const;

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_BRIEFING_META_ACTION_PRIORITY = 40 as const;

export function buildOwnerDailyBriefingEra25PostTerminalSealCommercialOpsPermanenceAction(
  slice: Era25PostTerminalSealCommercialOpsPermanenceEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.permanenceBlocked;
  const href = slice.commercialOpsHref;

  return {
    id: "era25-post-terminal-seal-commercial-ops-permanence",
    title: blocked
      ? slice.governanceReopenClaimed
        ? "Commercial ops permanence blocked: era25 governance reopen env detected"
        : !slice.continuousImprovementLoopIntegrityPassed
          ? "Commercial ops permanence blocked: improvement loop integrity FAIL"
          : !slice.era25GovernanceTrainSealed
            ? "Commercial ops permanence: complete governance train terminal seal first"
            : "Commercial ops permanence: attest after terminal seal + improvement loop PASS"
      : "Era25 post-seal commercial ops permanence active",
    reason: `${formatEra25PostTerminalSealCommercialOpsPermanenceEra25Label(slice)}. ${blocked ? "After governance train terminal seal, attest commercial ops permanence only when improvement loop integrity PASS and era25 frozen governance env stays clear — sustain honest GO/commercial artifacts without reopening era47–AN train." : "Sustain honest commercial pilot artifact rhythm and improvement loop; era25 governance train remains permanently sealed."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Attest ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_* only when terminal seal is active, governance chain closed, and continuous improvement loop integrity PASS.",
    priority: ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: blocked ? "Open commercial ops" : "View permanence",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25PostTerminalSealCommercialOpsPermanenceTopActions(
  permanenceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!permanenceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [permanenceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

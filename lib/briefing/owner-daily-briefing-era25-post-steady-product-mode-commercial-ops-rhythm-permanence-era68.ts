import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25PostSteadyProductModeCommercialOpsRhythmPermanenceEra25Label,
  type Era25PostSteadyProductModeCommercialOpsRhythmPermanenceEra25UiSlice,
} from "@/lib/commercial/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ERA68_POLICY_ID =
  "era68-owner-daily-briefing-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-v1" as const;

export const ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_BRIEFING_META_ACTION_PRIORITY =
  43 as const;

export function buildOwnerDailyBriefingEra25PostSteadyProductModeCommercialOpsRhythmPermanenceAction(
  slice: Era25PostSteadyProductModeCommercialOpsRhythmPermanenceEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.rhythmPermanenceBlocked;
  const href = slice.commercialOpsHref;

  return {
    id: "era25-post-steady-product-mode-commercial-ops-rhythm-permanence",
    title: blocked
      ? slice.governanceReopenClaimed
        ? "Commercial ops rhythm permanence blocked: era25 governance reopen env detected"
        : !slice.continuousImprovementLoopIntegrityPassed
          ? "Commercial ops rhythm permanence blocked: improvement loop integrity FAIL"
          : !slice.postBandAGovernanceSteadyProductModeWitnessActive
            ? "Commercial ops rhythm permanence: complete steady product mode witness first"
            : "Commercial ops rhythm permanence: attest after steady product mode + improvement loop PASS"
      : "Era25 commercial ops rhythm permanence active",
    reason: `${formatEra25PostSteadyProductModeCommercialOpsRhythmPermanenceEra25Label(slice)}. ${blocked ? "After steady product mode witness, attest commercial ops rhythm permanence only when improvement loop integrity PASS and era25 frozen governance env stays clear — sustain honest GO/commercial artifacts with zero era25 env mutation forever." : "Sustain honest commercial pilot artifact rhythm and improvement loop; era25 governance chain remains permanently closed."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Attest ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_* only when steady product mode witness is active, governance chain closed, and continuous improvement loop integrity PASS.",
    priority: ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: blocked ? "Open commercial ops" : "View rhythm permanence",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25PostSteadyProductModeCommercialOpsRhythmPermanenceTopActions(
  rhythmPermanenceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!rhythmPermanenceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [rhythmPermanenceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

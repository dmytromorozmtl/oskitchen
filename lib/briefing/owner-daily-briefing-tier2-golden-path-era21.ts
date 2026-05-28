import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatTier2GoldenPathPhaseBlockerDetail,
  resolveNextIncompleteTier2GoldenPathPhase,
} from "@/lib/commercial/tier2-staging-golden-path-phases-era21";
import {
  formatTier2GoldenPathProgressLabel,
  type Tier2GoldenPathUiSlice,
} from "@/lib/commercial/tier2-staging-golden-path-ui-era21";

export const OWNER_DAILY_BRIEFING_TIER2_GOLDEN_PATH_ERA21_POLICY_ID =
  "era21-owner-daily-briefing-tier2-golden-path-v1" as const;

export const TIER2_GOLDEN_PATH_BRIEFING_ACTION_PRIORITY = 1 as const;

export function buildOwnerDailyBriefingTier2GoldenPathAction(
  slice: Tier2GoldenPathUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.blocked) return null;

  const nextPhase = resolveNextIncompleteTier2GoldenPathPhase(slice.phases);
  const phaseDetail = nextPhase
    ? formatTier2GoldenPathPhaseBlockerDetail(nextPhase)
    : formatTier2GoldenPathProgressLabel(slice);

  return {
    id: "tier2-golden-path-staging",
    title: nextPhase
      ? `Tier 2 golden path — ${nextPhase.label.replace(/^Phase \d+ — /, "")}`
      : "Tier 2 golden path — execute staging checklist",
    reason: `${formatTier2GoldenPathProgressLabel(slice)}. ${phaseDetail}`,
    severity: "critical",
    ownerRole: "owner",
    href: slice.launchWizardHref,
    status: "open",
    unblockCondition:
      "Complete Woo → Order Hub → KDS → Packing on staging, record TIER2_* env vars + GitHub KDS URL, then re-run smoke:tier2-staging-golden-path.",
    priority: TIER2_GOLDEN_PATH_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open Tier 2 checklist",
    tone: "urgent",
  };
}

export function mergeBriefingTier2GoldenPathTopActions(
  tier2Action: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!tier2Action) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [tier2Action, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

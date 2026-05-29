import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatCommercialInflectionMilestoneLabel,
  formatCommercialInflectionScorecardLabel,
  type CommercialInflectionReadinessUiSlice,
} from "@/lib/commercial/commercial-inflection-readiness-ui-era28";

export const OWNER_DAILY_BRIEFING_COMMERCIAL_INFLECTION_ERA28_POLICY_ID =
  "era28-owner-daily-briefing-commercial-inflection-v1" as const;

export const COMMERCIAL_INFLECTION_BRIEFING_ACTION_PRIORITY = 2 as const;

export function buildOwnerDailyBriefingCommercialInflectionAction(
  slice: CommercialInflectionReadinessUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.blocked) return null;
  if (slice.milestone === "p0_ops_vault_blocked") return null;

  const milestoneLabel = formatCommercialInflectionMilestoneLabel(slice.milestone);

  return {
    id: "commercial-inflection-readiness",
    title: `Commercial inflection — ${milestoneLabel}`,
    reason: `${formatCommercialInflectionScorecardLabel(slice)}. ${slice.topBlockerTitle}: ${slice.topBlockerDetail}`,
    severity: slice.milestone === "commercial_inflection_attention" ? "high" : "critical",
    ownerRole: "owner",
    href: slice.platformOpsHref,
    status: "open",
    unblockCondition:
      "Advance honest artifacts: P0 proof_passed → Tier2 proof_passed → pilot GO — never treat SKIPPED as PASS.",
    priority: COMMERCIAL_INFLECTION_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open inflection matrix",
    tone: "urgent",
  };
}

export function mergeBriefingCommercialInflectionTopActions(
  inflectionAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!inflectionAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [inflectionAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

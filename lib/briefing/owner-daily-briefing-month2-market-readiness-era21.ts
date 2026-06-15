import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatMonth2MarketReadinessPhaseBlockerDetail,
  resolveNextIncompleteMonth2MarketReadinessPhase,
} from "@/lib/commercial/month2-market-readiness-phases-era21";
import {
  formatMonth2MarketReadinessProgressLabel,
  type Month2MarketReadinessUiSlice,
} from "@/lib/commercial/month2-market-readiness-ui-era21";

export const OWNER_DAILY_BRIEFING_MONTH2_MARKET_READINESS_ERA21_POLICY_ID =
  "era21-owner-daily-briefing-month2-market-readiness-v1" as const;

export const MONTH2_MARKET_READINESS_BRIEFING_ACTION_PRIORITY = 4 as const;

export function buildOwnerDailyBriefingMonth2MarketReadinessAction(
  slice: Month2MarketReadinessUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.blocked) return null;

  const nextPhase = resolveNextIncompleteMonth2MarketReadinessPhase(slice.phases);
  const phaseDetail = nextPhase
    ? formatMonth2MarketReadinessPhaseBlockerDetail(nextPhase)
    : formatMonth2MarketReadinessProgressLabel(slice);

  const href =
    nextPhase?.id === "workstream_a_investor_onepager"
      ? slice.reportsHref
      : nextPhase?.id === "workstream_b_gtm_icp_landings"
        ? slice.ghostKitchenLandingHref
        : nextPhase?.id === "workstream_d_case_study_publish"
          ? slice.implementationHref
          : nextPhase?.id === "workstream_e_second_pilot_pipeline"
            ? slice.implementationHref
            : slice.todayHref;

  return {
    id: "month2-market-readiness",
    title: nextPhase
      ? `Month 2 — ${nextPhase.label.replace(/^Workstream [A-E] — /, "")}`
      : "Month 2 — market readiness workstreams",
    reason: `${formatMonth2MarketReadinessProgressLabel(slice)}. ${phaseDetail}`,
    severity: "high",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete investor one-pager with real KPIs, review ICP landing copy, obtain case study approval, then re-run smokes — never fabricate traction.",
    priority: MONTH2_MARKET_READINESS_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open Month 2 checklist",
    tone: "urgent",
  };
}

export function mergeBriefingMonth2MarketReadinessTopActions(
  month2Action: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!month2Action) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [month2Action, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

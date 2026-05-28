import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatMarketLeaderPositioningPhaseBlockerDetail,
  resolveNextIncompleteMarketLeaderPositioningPhase,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import {
  formatMarketLeaderPositioningProgressLabel,
  type MarketLeaderPositioningUiSlice,
} from "@/lib/commercial/market-leader-positioning-ui-era21";

export const OWNER_DAILY_BRIEFING_MARKET_LEADER_POSITIONING_ERA21_POLICY_ID =
  "era21-owner-daily-briefing-market-leader-positioning-v1" as const;

export const MARKET_LEADER_POSITIONING_BRIEFING_ACTION_PRIORITY = 7 as const;

export function buildOwnerDailyBriefingMarketLeaderPositioningAction(
  slice: MarketLeaderPositioningUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.blocked) return null;

  const nextPhase = resolveNextIncompleteMarketLeaderPositioningPhase(slice.phases);
  const phaseDetail = nextPhase
    ? formatMarketLeaderPositioningPhaseBlockerDetail(nextPhase)
    : formatMarketLeaderPositioningProgressLabel(slice);

  const href =
    nextPhase?.id === "pillar1_category_narrative"
      ? slice.ghostKitchenLandingHref
      : nextPhase?.id === "pillar2_competitive_moat_proof"
        ? slice.integrationHealthHref
        : nextPhase?.id === "pillar3_analyst_press_kit"
          ? slice.implementationHref
          : nextPhase?.id === "pillar4_expansion_revenue_motion"
            ? slice.reportsHref
            : slice.todayHref;

  return {
    id: "market-leader-positioning",
    title: nextPhase
      ? `Market leader — ${nextPhase.label.replace(/^Pillar \d+ — /, "")}`
      : "Market leader positioning — category + moat + analyst kit",
    reason: `${formatMarketLeaderPositioningProgressLabel(slice)}. ${phaseDetail}`,
    severity: "high",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Review category narrative with customer-approved case study, moat deck with artifact citations, honest analyst kit, and expansion motion from pilot #1 — never claim market leader without evidence.",
    priority: MARKET_LEADER_POSITIONING_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open market leader checklist",
    tone: "urgent",
  };
}

export function mergeBriefingMarketLeaderPositioningTopActions(
  marketLeaderAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!marketLeaderAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [marketLeaderAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

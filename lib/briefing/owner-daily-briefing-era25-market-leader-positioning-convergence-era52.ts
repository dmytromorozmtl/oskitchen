import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatMarketLeaderPositioningConvergenceEra25Label,
  type MarketLeaderPositioningConvergenceEra25UiSlice,
} from "@/lib/commercial/market-leader-positioning-convergence-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_MARKET_LEADER_POSITIONING_CONVERGENCE_ERA52_POLICY_ID =
  "era52-owner-daily-briefing-era25-market-leader-positioning-convergence-v1" as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY = 27 as const;

export function buildOwnerDailyBriefingEra25MarketLeaderPositioningConvergenceAction(
  slice: MarketLeaderPositioningConvergenceEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked =
    slice.convergenceBlocked ||
    slice.marketLeaderPositioningConvergenceEra25Milestone !==
      "market_leader_positioning_convergence_era25_ready";
  const href = slice.platformOpsHref;

  return {
    id: "era25-market-leader-positioning-convergence",
    title: blocked
      ? `Market leader blocked: ${slice.marketLeaderPositioningConvergenceEra25Milestone.replaceAll("_", " ")}`
      : `Era25 market leader — ${slice.completedBlockingCount}/${slice.totalBlockingCount} pillars ready`,
    reason: `${formatMarketLeaderPositioningConvergenceEra25Label(slice)}. ${blocked ? "Complete Series A partner expansion convergence, then execute pillars 1–4 with honest MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_* env before era25 sustained operational excellence convergence." : "Market leader convergence ready — proceed to sustained ops on #era25-sustained-operational-excellence-convergence."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete market leader convergence with honest Series A integrity — never hand-edit PASS in artifacts.",
    priority: MARKET_LEADER_POSITIONING_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: "Open market leader convergence",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25MarketLeaderPositioningConvergenceTopActions(
  marketLeaderPositioningConvergenceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!marketLeaderPositioningConvergenceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [marketLeaderPositioningConvergenceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

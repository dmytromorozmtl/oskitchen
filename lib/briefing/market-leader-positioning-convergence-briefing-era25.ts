/**
 * era25 Market Leader Positioning Convergence — briefing ranked action.
 */
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatMarketLeaderPositioningPhaseBlockerDetail,
} from "@/lib/commercial/market-leader-positioning-phases-era21";
import type { MarketLeaderPositioningConvergenceState } from "@/lib/commercial/load-market-leader-positioning-convergence-state-era25";
import {
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
} from "@/lib/commercial/market-leader-positioning-convergence-phases-era25";
import {
  SERIES_A_GHOST_KITCHEN_LANDING_ROUTE,
  SERIES_A_PLATFORM_OPS_ROUTE,
} from "@/lib/commercial/market-leader-positioning-phases-era21";

export const MARKET_LEADER_POSITIONING_CONVERGENCE_BRIEFING_ERA25_POLICY_ID =
  "era25-market-leader-positioning-convergence-briefing-v1" as const;

export const MARKET_LEADER_POSITIONING_CONVERGENCE_BRIEFING_ACTION_PRIORITY = 7 as const;

function resolveMarketLeaderBriefingHref(nextPhaseId: string | null): string {
  switch (nextPhaseId) {
    case "pillar1_category_narrative":
      return SERIES_A_GHOST_KITCHEN_LANDING_ROUTE;
    case "pillar2_competitive_moat_proof":
      return "/dashboard/integration-health";
    case "pillar3_analyst_press_kit":
      return "/dashboard/implementation";
    case "pillar4_expansion_revenue_motion":
      return "/dashboard/reports";
    default:
      return `${SERIES_A_PLATFORM_OPS_ROUTE}${MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`;
  }
}

export function buildMarketLeaderPositioningConvergenceBriefingAction(input: {
  seriesAConvergenceReady: boolean;
  marketLeaderState: MarketLeaderPositioningConvergenceState;
}): OwnerDailyBriefingRankedAction | null {
  if (!input.seriesAConvergenceReady) return null;
  if (input.marketLeaderState.marketLeaderComplete) return null;

  const nextPhase =
    input.marketLeaderState.phases.find((phase) => !phase.optional && !phase.complete) ??
    input.marketLeaderState.phases.find((phase) => !phase.complete) ??
    null;
  const progress = `${input.marketLeaderState.completedBlockingCount}/${input.marketLeaderState.totalBlockingCount} pillars`;

  return {
    id: "market-leader-positioning-convergence-era25",
    title: nextPhase
      ? `Market leader — ${nextPhase.label.replace(/^Pillar \d+ — /, "")}`
      : "Market leader positioning — category + moat + analyst kit",
    reason: nextPhase
      ? `${progress} · ${formatMarketLeaderPositioningPhaseBlockerDetail(nextPhase)}`
      : `${progress} · Publish category narrative, moat deck, analyst kit, expansion motion — never fake PASS`,
    severity: "high",
    ownerRole: "owner",
    href: resolveMarketLeaderBriefingHref(input.marketLeaderState.nextPhaseId),
    status: "open",
    unblockCondition:
      "Review category narrative with customer-approved case study, moat deck with artifact citations, honest analyst kit, and expansion motion from pilot #1 — never claim market leader without evidence.",
    priority: MARKET_LEADER_POSITIONING_CONVERGENCE_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open market leader convergence",
    tone: "urgent",
  };
}

export type LaunchWizardMarketLeaderPositioningConvergenceSlice = {
  completedBlockingCount: number;
  totalBlockingCount: number;
  marketLeaderComplete: boolean;
  nextPhaseLabel: string | null;
  headline: string;
  href: string;
};

export function buildLaunchWizardMarketLeaderPositioningConvergenceSlice(
  marketLeaderState: MarketLeaderPositioningConvergenceState,
): LaunchWizardMarketLeaderPositioningConvergenceSlice {
  return {
    completedBlockingCount: marketLeaderState.completedBlockingCount,
    totalBlockingCount: marketLeaderState.totalBlockingCount,
    marketLeaderComplete: marketLeaderState.marketLeaderComplete,
    nextPhaseLabel: marketLeaderState.nextPhaseLabel,
    headline: marketLeaderState.marketLeaderComplete
      ? "Market leader positioning complete — ready for sustained operational excellence"
      : marketLeaderState.nextPhaseLabel
        ? `Market leader ${marketLeaderState.completedBlockingCount}/${marketLeaderState.totalBlockingCount} — ${marketLeaderState.nextPhaseLabel.replace(/^Pillar \d+ — /, "")}`
        : `Market leader ${marketLeaderState.completedBlockingCount}/${marketLeaderState.totalBlockingCount} pillars in progress`,
    href: "/dashboard/launch-wizard#launch-wizard-commercial-blockers",
  };
}

export function mergeBriefingMarketLeaderPositioningConvergenceEra25TopActions(
  marketLeaderConvergenceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!marketLeaderConvergenceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [marketLeaderConvergenceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatMonth2MarketReadinessConvergenceEra25Label,
  type Month2MarketReadinessConvergenceEra25UiSlice,
} from "@/lib/commercial/month2-market-readiness-convergence-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_MONTH2_MARKET_READINESS_CONVERGENCE_ERA49_POLICY_ID =
  "era49-owner-daily-briefing-era25-month2-market-readiness-convergence-v1" as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY = 24 as const;

export function buildOwnerDailyBriefingEra25Month2MarketReadinessConvergenceAction(
  slice: Month2MarketReadinessConvergenceEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked =
    slice.convergenceBlocked ||
    slice.month2MarketReadinessConvergenceEra25Milestone !==
      "month2_market_readiness_convergence_era25_ready";
  const href = slice.platformOpsHref;

  return {
    id: "era25-month2-market-readiness-convergence",
    title: blocked
      ? `Month 2 blocked: ${slice.month2MarketReadinessConvergenceEra25Milestone.replaceAll("_", " ")}`
      : `Era25 month 2 — ${slice.completedBlockingCount}/${slice.totalBlockingCount} workstreams ready`,
    reason: `${formatMonth2MarketReadinessConvergenceEra25Label(slice)}. ${blocked ? "Complete pilot week 1 execution convergence, then execute workstreams A–E with honest MONTH2_* env before era25 scale readiness convergence." : "Month 2 convergence ready — proceed to scale readiness on #era25-scale-readiness-convergence."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete month 2 convergence with honest week 1 integrity — never hand-edit PASS in artifacts.",
    priority: MONTH2_MARKET_READINESS_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: "Open Month 2 convergence",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25Month2MarketReadinessConvergenceTopActions(
  month2MarketReadinessConvergenceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!month2MarketReadinessConvergenceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [month2MarketReadinessConvergenceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

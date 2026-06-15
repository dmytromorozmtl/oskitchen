import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatSeriesAPartnerExpansionConvergenceEra25Label,
  type SeriesAPartnerExpansionConvergenceEra25UiSlice,
} from "@/lib/commercial/series-a-partner-expansion-convergence-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA51_POLICY_ID =
  "era51-owner-daily-briefing-era25-series-a-partner-expansion-convergence-v1" as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY = 26 as const;

export function buildOwnerDailyBriefingEra25SeriesAPartnerExpansionConvergenceAction(
  slice: SeriesAPartnerExpansionConvergenceEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked =
    slice.convergenceBlocked ||
    slice.seriesAPartnerExpansionConvergenceEra25Milestone !==
      "series_a_partner_expansion_convergence_era25_ready";
  const href = slice.platformOpsHref;

  return {
    id: "era25-series-a-partner-expansion-convergence",
    title: blocked
      ? `Series A blocked: ${slice.seriesAPartnerExpansionConvergenceEra25Milestone.replaceAll("_", " ")}`
      : `Era25 Series A — ${slice.completedBlockingCount}/${slice.totalBlockingCount} tracks ready`,
    reason: `${formatSeriesAPartnerExpansionConvergenceEra25Label(slice)}. ${blocked ? "Complete scale readiness convergence, then execute tracks A–D with honest SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_* env before era25 market leader positioning convergence." : "Series A convergence ready — proceed to market leader positioning on #era25-market-leader-positioning-convergence."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete Series A convergence with honest scale integrity — never hand-edit PASS in artifacts.",
    priority: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: "Open Series A convergence",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25SeriesAPartnerExpansionConvergenceTopActions(
  seriesAPartnerExpansionConvergenceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!seriesAPartnerExpansionConvergenceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [seriesAPartnerExpansionConvergenceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

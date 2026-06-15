import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatSeriesAPartnerExpansionPhaseBlockerDetail,
  resolveNextIncompleteSeriesAPartnerExpansionPhase,
} from "@/lib/commercial/series-a-partner-expansion-phases-era21";
import {
  formatSeriesAPartnerExpansionProgressLabel,
  type SeriesAPartnerExpansionUiSlice,
} from "@/lib/commercial/series-a-partner-expansion-ui-era21";

export const OWNER_DAILY_BRIEFING_SERIES_A_PARTNER_EXPANSION_ERA21_POLICY_ID =
  "era21-owner-daily-briefing-series-a-partner-expansion-v1" as const;

export const SERIES_A_PARTNER_EXPANSION_BRIEFING_ACTION_PRIORITY = 6 as const;

export function buildOwnerDailyBriefingSeriesAPartnerExpansionAction(
  slice: SeriesAPartnerExpansionUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.blocked) return null;

  const nextPhase = resolveNextIncompleteSeriesAPartnerExpansionPhase(slice.phases);
  const phaseDetail = nextPhase
    ? formatSeriesAPartnerExpansionPhaseBlockerDetail(nextPhase)
    : formatSeriesAPartnerExpansionProgressLabel(slice);

  const href =
    nextPhase?.id === "track_a_series_a_data_room" || nextPhase?.id === "track_d_customer_success_repeatability"
      ? slice.reportsHref
      : nextPhase?.id === "track_b_partner_channel_expansion"
        ? slice.integrationHealthHref
        : nextPhase?.id === "track_c_multi_region_playbook"
          ? slice.implementationHref
          : slice.todayHref;

  return {
    id: "series-a-partner-expansion",
    title: nextPhase
      ? `Series A / partners — ${nextPhase.label.replace(/^Track [A-D] — /, "")}`
      : "Series A / partners — fundraise + channel expansion",
    reason: `${formatSeriesAPartnerExpansionProgressLabel(slice)}. ${phaseDetail}`,
    severity: "high",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Publish audited data room bundle, honest partner one-pager, multi-region playbook, and CS repeatability from pilot #1 metrics — never fake PASS in artifacts.",
    priority: SERIES_A_PARTNER_EXPANSION_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open Series A / partner checklist",
    tone: "urgent",
  };
}

export function mergeBriefingSeriesAPartnerExpansionTopActions(
  seriesAAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!seriesAAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [seriesAAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

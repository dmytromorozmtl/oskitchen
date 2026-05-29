/**
 * era25 Series A / Partner Expansion Convergence — briefing ranked action.
 */
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatSeriesAPartnerExpansionPhaseBlockerDetail,
} from "@/lib/commercial/series-a-partner-expansion-phases-era21";
import type { SeriesAPartnerExpansionConvergenceState } from "@/lib/commercial/load-series-a-partner-expansion-convergence-state-era25";
import {
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
} from "@/lib/commercial/series-a-partner-expansion-convergence-phases-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_BRIEFING_ERA25_POLICY_ID =
  "era25-series-a-partner-expansion-convergence-briefing-v1" as const;

export const SERIES_A_PARTNER_EXPANSION_CONVERGENCE_BRIEFING_ACTION_PRIORITY = 6 as const;

function resolveSeriesABriefingHref(nextPhaseId: string | null): string {
  switch (nextPhaseId) {
    case "track_a_series_a_data_room":
    case "track_d_customer_success_repeatability":
      return "/dashboard/reports";
    case "track_b_partner_channel_expansion":
      return "/dashboard/integration-health";
    case "track_c_multi_region_playbook":
      return "/dashboard/implementation";
    default:
      return `${SERIES_A_PLATFORM_OPS_ROUTE}${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`;
  }
}

export function buildSeriesAPartnerExpansionConvergenceBriefingAction(input: {
  scaleConvergenceReady: boolean;
  seriesAState: SeriesAPartnerExpansionConvergenceState;
}): OwnerDailyBriefingRankedAction | null {
  if (!input.scaleConvergenceReady) return null;
  if (input.seriesAState.seriesAComplete) return null;

  const nextPhase =
    input.seriesAState.phases.find((phase) => !phase.optional && !phase.complete) ??
    input.seriesAState.phases.find((phase) => !phase.complete) ??
    null;
  const progress = `${input.seriesAState.completedBlockingCount}/${input.seriesAState.totalBlockingCount} tracks`;

  return {
    id: "series-a-partner-expansion-convergence-era25",
    title: nextPhase
      ? `Series A — ${nextPhase.label.replace(/^Track [A-D] — /, "")}`
      : "Series A / partners — fundraise + channel expansion",
    reason: nextPhase
      ? `${progress} · ${formatSeriesAPartnerExpansionPhaseBlockerDetail(nextPhase)}`
      : `${progress} · Publish data room bundle, partner one-pager, multi-region playbook, CS repeatability — never fake PASS`,
    severity: "high",
    ownerRole: "owner",
    href: resolveSeriesABriefingHref(input.seriesAState.nextPhaseId),
    status: "open",
    unblockCondition:
      "Audited data room bundle, honest partner one-pager, multi-region playbook, CS repeatability from pilot #1 metrics — never fabricate PASS.",
    priority: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open Series A convergence",
    tone: "urgent",
  };
}

export type LaunchWizardSeriesAPartnerExpansionConvergenceSlice = {
  completedBlockingCount: number;
  totalBlockingCount: number;
  seriesAComplete: boolean;
  nextPhaseLabel: string | null;
  headline: string;
  href: string;
};

export function buildLaunchWizardSeriesAPartnerExpansionConvergenceSlice(
  seriesAState: SeriesAPartnerExpansionConvergenceState,
): LaunchWizardSeriesAPartnerExpansionConvergenceSlice {
  return {
    completedBlockingCount: seriesAState.completedBlockingCount,
    totalBlockingCount: seriesAState.totalBlockingCount,
    seriesAComplete: seriesAState.seriesAComplete,
    nextPhaseLabel: seriesAState.nextPhaseLabel,
    headline: seriesAState.seriesAComplete
      ? "Series A / partner expansion complete — ready for market leader positioning"
      : seriesAState.nextPhaseLabel
        ? `Series A ${seriesAState.completedBlockingCount}/${seriesAState.totalBlockingCount} — ${seriesAState.nextPhaseLabel.replace(/^Track [A-D] — /, "")}`
        : `Series A ${seriesAState.completedBlockingCount}/${seriesAState.totalBlockingCount} tracks in progress`,
    href: "/dashboard/launch-wizard#launch-wizard-commercial-blockers",
  };
}

export function mergeBriefingSeriesAPartnerExpansionConvergenceEra25TopActions(
  seriesAConvergenceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!seriesAConvergenceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [seriesAConvergenceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

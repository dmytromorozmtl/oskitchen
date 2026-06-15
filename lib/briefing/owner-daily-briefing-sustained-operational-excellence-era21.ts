import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatSustainedOperationalExcellencePhaseBlockerDetail,
  resolveNextIncompleteSustainedOperationalExcellencePhase,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import {
  formatSustainedOperationalExcellenceProgressLabel,
  type SustainedOperationalExcellenceUiSlice,
} from "@/lib/commercial/sustained-operational-excellence-ui-era21";

export const OWNER_DAILY_BRIEFING_SUSTAINED_OPERATIONAL_EXCELLENCE_ERA21_POLICY_ID =
  "era21-owner-daily-briefing-sustained-operational-excellence-v1" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_BRIEFING_ACTION_PRIORITY = 8 as const;

export function buildOwnerDailyBriefingSustainedOperationalExcellenceAction(
  slice: SustainedOperationalExcellenceUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.blocked) return null;

  const nextPhase = resolveNextIncompleteSustainedOperationalExcellencePhase(slice.phases);
  const phaseDetail = nextPhase
    ? formatSustainedOperationalExcellencePhaseBlockerDetail(nextPhase)
    : formatSustainedOperationalExcellenceProgressLabel(slice);

  const href =
    nextPhase?.id === "cadence_a_daily_operational"
      ? slice.orderHubHref
      : nextPhase?.id === "cadence_b_weekly_integration"
        ? slice.integrationHealthHref
        : nextPhase?.id === "cadence_c_monthly_metrics"
          ? slice.reportsHref
          : nextPhase?.id === "cadence_d_quarterly_governance"
            ? slice.implementationHref
            : slice.todayHref;

  return {
    id: "sustained-operational-excellence",
    title: nextPhase
      ? `Sustained ops — ${nextPhase.label.replace(/^Cadence [A-D] — /, "")}`
      : "Sustained operational excellence — recurring ops cadence",
    reason: `${formatSustainedOperationalExcellenceProgressLabel(slice)}. ${phaseDetail}`,
    severity: "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Establish daily shift cadence, weekly integration reviews, monthly metrics refresh, and quarterly governance audit — never hand-edit PASS in artifacts.",
    priority: SUSTAINED_OPERATIONAL_EXCELLENCE_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open sustained ops checklist",
    tone: "normal",
  };
}

export function mergeBriefingSustainedOperationalExcellenceTopActions(
  sustainedOpsAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!sustainedOpsAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [sustainedOpsAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

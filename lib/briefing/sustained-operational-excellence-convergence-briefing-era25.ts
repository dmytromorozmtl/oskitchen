/**
 * era25 Sustained Operational Excellence Convergence — briefing ranked action.
 */
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatSustainedOperationalExcellencePhaseBlockerDetail,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { SustainedOperationalExcellenceConvergenceState } from "@/lib/commercial/load-sustained-operational-excellence-convergence-state-era25";
import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
} from "@/lib/commercial/sustained-operational-excellence-convergence-phases-era25";
import {
  SERIES_A_PLATFORM_OPS_ROUTE,
  SUSTAINED_OPS_ORDER_HUB_ROUTE,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_BRIEFING_ERA25_POLICY_ID =
  "era25-sustained-operational-excellence-convergence-briefing-v1" as const;

export const SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_BRIEFING_ACTION_PRIORITY = 8 as const;

function resolveSustainedOpsBriefingHref(nextPhaseId: string | null): string {
  switch (nextPhaseId) {
    case "cadence_a_daily_operational":
      return SUSTAINED_OPS_ORDER_HUB_ROUTE;
    case "cadence_b_weekly_integration":
      return "/dashboard/integration-health";
    case "cadence_c_monthly_metrics":
      return "/dashboard/reports";
    case "cadence_d_quarterly_governance":
      return "/dashboard/implementation";
    default:
      return `${SERIES_A_PLATFORM_OPS_ROUTE}${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`;
  }
}

export function buildSustainedOperationalExcellenceConvergenceBriefingAction(input: {
  marketLeaderConvergenceReady: boolean;
  sustainedOpsState: SustainedOperationalExcellenceConvergenceState;
}): OwnerDailyBriefingRankedAction | null {
  if (!input.marketLeaderConvergenceReady) return null;
  if (input.sustainedOpsState.sustainedOpsComplete) return null;

  const nextPhase =
    input.sustainedOpsState.phases.find((phase) => !phase.optional && !phase.complete) ??
    input.sustainedOpsState.phases.find((phase) => !phase.complete) ??
    null;
  const progress = `${input.sustainedOpsState.completedBlockingCount}/${input.sustainedOpsState.totalBlockingCount} cadences`;

  return {
    id: "sustained-operational-excellence-convergence-era25",
    title: nextPhase
      ? `Sustained ops — ${nextPhase.label.replace(/^Cadence [A-D] — /, "")}`
      : "Sustained operational excellence — recurring ops cadence",
    reason: nextPhase
      ? `${progress} · ${formatSustainedOperationalExcellencePhaseBlockerDetail(nextPhase)}`
      : `${progress} · Establish daily shift cadence, weekly integration, monthly metrics, quarterly governance — never fake PASS`,
    severity: "normal",
    ownerRole: "owner",
    href: resolveSustainedOpsBriefingHref(input.sustainedOpsState.nextPhaseId),
    status: "open",
    unblockCondition:
      "Establish daily shift cadence, weekly integration reviews, monthly metrics refresh, and quarterly governance audit — never hand-edit PASS in artifacts.",
    priority: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open sustained ops convergence",
    tone: "normal",
  };
}

export type LaunchWizardSustainedOperationalExcellenceConvergenceSlice = {
  completedBlockingCount: number;
  totalBlockingCount: number;
  sustainedOpsComplete: boolean;
  nextPhaseLabel: string | null;
  headline: string;
  href: string;
};

export function buildLaunchWizardSustainedOperationalExcellenceConvergenceSlice(
  sustainedOpsState: SustainedOperationalExcellenceConvergenceState,
): LaunchWizardSustainedOperationalExcellenceConvergenceSlice {
  return {
    completedBlockingCount: sustainedOpsState.completedBlockingCount,
    totalBlockingCount: sustainedOpsState.totalBlockingCount,
    sustainedOpsComplete: sustainedOpsState.sustainedOpsComplete,
    nextPhaseLabel: sustainedOpsState.nextPhaseLabel,
    headline: sustainedOpsState.sustainedOpsComplete
      ? "Sustained ops complete — pure operational mode + improvement loop"
      : sustainedOpsState.nextPhaseLabel
        ? `Sustained ops ${sustainedOpsState.completedBlockingCount}/${sustainedOpsState.totalBlockingCount} — ${sustainedOpsState.nextPhaseLabel.replace(/^Cadence [A-D] — /, "")}`
        : `Sustained ops ${sustainedOpsState.completedBlockingCount}/${sustainedOpsState.totalBlockingCount} cadences in progress`,
    href: "/dashboard/launch-wizard#launch-wizard-commercial-blockers",
  };
}

export function mergeBriefingSustainedOperationalExcellenceConvergenceEra25TopActions(
  sustainedOpsConvergenceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!sustainedOpsConvergenceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [sustainedOpsConvergenceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

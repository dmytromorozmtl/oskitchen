/**
 * era25 Month 2 Market Readiness Convergence — briefing ranked action.
 */
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatMonth2MarketReadinessPhaseBlockerDetail,
  MONTH2_GHOST_KITCHEN_LANDING_ROUTE,
  MONTH2_MEAL_PREP_LANDING_ROUTE,
} from "@/lib/commercial/month2-market-readiness-phases-era21";
import type { Month2MarketReadinessConvergenceState } from "@/lib/commercial/load-month2-market-readiness-convergence-state-era25";
import {
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
} from "@/lib/commercial/month2-market-readiness-convergence-phases-era25";

export const MONTH2_MARKET_READINESS_CONVERGENCE_BRIEFING_ERA25_POLICY_ID =
  "era25-month2-market-readiness-convergence-briefing-v1" as const;

export const MONTH2_MARKET_READINESS_CONVERGENCE_BRIEFING_ACTION_PRIORITY = 3 as const;

function resolveMonth2BriefingHref(nextPhaseId: string | null): string {
  switch (nextPhaseId) {
    case "workstream_a_investor_onepager":
      return "/dashboard/reports";
    case "workstream_b_gtm_icp_landings":
      return MONTH2_GHOST_KITCHEN_LANDING_ROUTE;
    case "workstream_d_case_study_publish":
      return "/dashboard/implementation";
    case "workstream_e_second_pilot_pipeline":
      return "/dashboard/implementation";
    default:
      return `/platform/commercial-pilot-ops${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`;
  }
}

export function buildMonth2MarketReadinessConvergenceBriefingAction(input: {
  week1ConvergenceReady: boolean;
  month2State: Month2MarketReadinessConvergenceState;
}): OwnerDailyBriefingRankedAction | null {
  if (!input.week1ConvergenceReady) return null;
  if (input.month2State.month2Complete) return null;

  const nextPhase =
    input.month2State.phases.find((phase) => !phase.optional && !phase.complete) ??
    input.month2State.phases.find((phase) => !phase.complete) ??
    null;
  const progress = `${input.month2State.completedBlockingCount}/${input.month2State.totalBlockingCount} workstreams`;

  return {
    id: "month2-market-readiness-convergence-era25",
    title: nextPhase
      ? `Month 2 — ${nextPhase.label.replace(/^Workstream [A-E] — /, "")}`
      : "Month 2 — market readiness workstreams",
    reason: nextPhase
      ? `${progress} · ${formatMonth2MarketReadinessPhaseBlockerDetail(nextPhase)}`
      : `${progress} · Complete investor + GTM + case study gates — never fake traction`,
    severity: "high",
    ownerRole: "owner",
    href: resolveMonth2BriefingHref(input.month2State.nextPhaseId),
    status: "open",
    unblockCondition:
      "Real KPIs in metrics baseline, investor one-pager smoke, ICP landing review, case study approval — never fabricate PASS.",
    priority: MONTH2_MARKET_READINESS_CONVERGENCE_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open Month 2 convergence",
    tone: "urgent",
  };
}

export type LaunchWizardMonth2MarketReadinessConvergenceSlice = {
  completedBlockingCount: number;
  totalBlockingCount: number;
  month2Complete: boolean;
  nextPhaseLabel: string | null;
  headline: string;
  href: string;
};

export function buildLaunchWizardMonth2MarketReadinessConvergenceSlice(
  month2State: Month2MarketReadinessConvergenceState,
): LaunchWizardMonth2MarketReadinessConvergenceSlice {
  return {
    completedBlockingCount: month2State.completedBlockingCount,
    totalBlockingCount: month2State.totalBlockingCount,
    month2Complete: month2State.month2Complete,
    nextPhaseLabel: month2State.nextPhaseLabel,
    headline: month2State.month2Complete
      ? "Month 2 market readiness complete — ready for scale readiness"
      : month2State.nextPhaseLabel
        ? `Month 2 ${month2State.completedBlockingCount}/${month2State.totalBlockingCount} — ${month2State.nextPhaseLabel.replace(/^Workstream [A-E] — /, "")}`
        : `Month 2 ${month2State.completedBlockingCount}/${month2State.totalBlockingCount} workstreams in progress`,
    href: "/dashboard/launch-wizard#launch-wizard-commercial-blockers",
  };
}

export function mergeBriefingMonth2MarketReadinessConvergenceEra25TopActions(
  month2ConvergenceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!month2ConvergenceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [month2ConvergenceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

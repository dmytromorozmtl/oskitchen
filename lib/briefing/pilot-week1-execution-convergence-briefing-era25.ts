/**
 * era25 Pilot Week 1 Execution Convergence — briefing ranked action.
 */
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatPilotWeek1ExecutionPhaseBlockerDetail,
} from "@/lib/commercial/pilot-week1-execution-phases-era21";
import type { PilotWeek1ExecutionConvergenceState } from "@/lib/commercial/load-pilot-week1-execution-convergence-state-era25";
import {
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
} from "@/lib/commercial/pilot-week1-execution-convergence-phases-era25";

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_BRIEFING_ERA25_POLICY_ID =
  "era25-pilot-week1-execution-convergence-briefing-v1" as const;

export const PILOT_WEEK1_EXECUTION_CONVERGENCE_BRIEFING_ACTION_PRIORITY = 2 as const;

function resolveWeek1BriefingHref(nextPhaseId: string | null): string {
  switch (nextPhaseId) {
    case "day1_ttv_onboarding":
      return "/dashboard/launch-wizard#launch-wizard-commercial-blockers";
    case "day2_integration_health":
      return "/dashboard/integration-health#integration-health-pilot-week1";
    case "day3_pos_money_path":
      return "/dashboard/pos/shifts";
    case "day4_reports_review":
      return "/dashboard/reports";
    case "day5_metrics_narrative":
      return `/platform/commercial-pilot-ops${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`;
    default:
      return `/platform/commercial-pilot-ops${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`;
  }
}

export function buildPilotWeek1ExecutionConvergenceBriefingAction(input: {
  goConvergenceReady: boolean;
  week1State: PilotWeek1ExecutionConvergenceState;
}): OwnerDailyBriefingRankedAction | null {
  if (!input.goConvergenceReady) return null;
  if (input.week1State.week1Complete) return null;

  const nextPhase = input.week1State.phases.find((phase) => !phase.complete) ?? null;
  const progress = `${input.week1State.completedPhaseCount}/${input.week1State.totalPhaseCount} days`;

  return {
    id: "pilot-week1-execution-convergence-era25",
    title: nextPhase
      ? `Pilot Week 1 — ${nextPhase.label.replace(/^Day \d+ — /, "")}`
      : "Pilot Week 1 — complete TTV through metrics baseline",
    reason: nextPhase
      ? `${progress} · ${formatPilotWeek1ExecutionPhaseBlockerDetail(nextPhase)}`
      : `${progress} · Execute Days 1–5 on real pilot workspace — never fake PASS`,
    severity: "high",
    ownerRole: "owner",
    href: resolveWeek1BriefingHref(input.week1State.nextPhaseId),
    status: "open",
    unblockCondition:
      "Record PILOT_WEEK1_* env vars after each day milestone, then Day 5 smokes for metrics + case study + GO re-run.",
    priority: PILOT_WEEK1_EXECUTION_CONVERGENCE_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open Week 1 convergence",
    tone: "urgent",
  };
}

export type LaunchWizardPilotWeek1ExecutionConvergenceSlice = {
  completedPhaseCount: number;
  totalPhaseCount: number;
  week1Complete: boolean;
  nextPhaseLabel: string | null;
  headline: string;
  href: string;
};

export function buildLaunchWizardPilotWeek1ExecutionConvergenceSlice(
  week1State: PilotWeek1ExecutionConvergenceState,
): LaunchWizardPilotWeek1ExecutionConvergenceSlice {
  return {
    completedPhaseCount: week1State.completedPhaseCount,
    totalPhaseCount: week1State.totalPhaseCount,
    week1Complete: week1State.week1Complete,
    nextPhaseLabel: week1State.nextPhaseLabel,
    headline: week1State.week1Complete
      ? "Pilot Week 1 complete — ready for month 2 readiness"
      : week1State.nextPhaseLabel
        ? `Pilot Week 1 ${week1State.completedPhaseCount}/${week1State.totalPhaseCount} — ${week1State.nextPhaseLabel.replace(/^Day \d+ — /, "")}`
        : `Pilot Week 1 ${week1State.completedPhaseCount}/${week1State.totalPhaseCount} days in progress`,
    href: "/dashboard/launch-wizard#launch-wizard-commercial-blockers",
  };
}

export function mergeBriefingPilotWeek1ExecutionConvergenceEra25TopActions(
  week1ConvergenceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!week1ConvergenceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [week1ConvergenceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

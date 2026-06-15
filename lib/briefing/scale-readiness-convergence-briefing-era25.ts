/**
 * era25 Scale Readiness Convergence — briefing ranked action.
 */
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatScaleReadinessPhaseBlockerDetail,
} from "@/lib/commercial/scale-readiness-phases-era21";
import type { ScaleReadinessConvergenceState } from "@/lib/commercial/load-scale-readiness-convergence-state-era25";
import {
  SCALE_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
} from "@/lib/commercial/scale-readiness-convergence-phases-era25";
import { SERIES_A_PLATFORM_OPS_ROUTE } from "@/lib/commercial/sustained-operational-excellence-phases-era21";

export const SCALE_READINESS_CONVERGENCE_BRIEFING_ERA25_POLICY_ID =
  "era25-scale-readiness-convergence-briefing-v1" as const;

export const SCALE_READINESS_CONVERGENCE_BRIEFING_ACTION_PRIORITY = 5 as const;

function resolveScaleBriefingHref(nextPhaseId: string | null): string {
  switch (nextPhaseId) {
    case "gate1_per_customer_pilot_ops":
    case "gate4_operational_resilience":
    case "gate5_data_room_artifact_chain":
      return `${SERIES_A_PLATFORM_OPS_ROUTE}${SCALE_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`;
    case "gate2_soc2_readiness_track":
    case "gate6_second_paid_pilot_optional":
      return "/dashboard/implementation";
    case "gate3_enterprise_sso_production":
      return "/dashboard/integration-health";
    default:
      return `${SERIES_A_PLATFORM_OPS_ROUTE}${SCALE_READINESS_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`;
  }
}

export function buildScaleReadinessConvergenceBriefingAction(input: {
  month2ConvergenceReady: boolean;
  scaleState: ScaleReadinessConvergenceState;
}): OwnerDailyBriefingRankedAction | null {
  if (!input.month2ConvergenceReady) return null;
  if (input.scaleState.scaleComplete) return null;

  const nextPhase =
    input.scaleState.phases.find((phase) => !phase.optional && !phase.complete) ??
    input.scaleState.phases.find((phase) => !phase.complete) ??
    null;
  const progress = `${input.scaleState.completedBlockingCount}/${input.scaleState.totalBlockingCount} gates`;

  return {
    id: "scale-readiness-convergence-era25",
    title: nextPhase
      ? `Scale — ${nextPhase.label.replace(/^Gate \d+ — /, "")}`
      : "Scale readiness — enterprise expansion gates",
    reason: nextPhase
      ? `${progress} · ${formatScaleReadinessPhaseBlockerDetail(nextPhase)}`
      : `${progress} · Complete per-customer GO isolation, SOC2 track, SSO, resilience drills, data room — never fake certification`,
    severity: "high",
    ownerRole: "owner",
    href: resolveScaleBriefingHref(input.scaleState.nextPhaseId),
    status: "open",
    unblockCondition:
      "Isolate GO per customer, complete SOC2 track review, SSO cutover or honest deferral, resilience drills, then publish audited data room index — never fabricate PASS.",
    priority: SCALE_READINESS_CONVERGENCE_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open Scale convergence",
    tone: "urgent",
  };
}

export type LaunchWizardScaleReadinessConvergenceSlice = {
  completedBlockingCount: number;
  totalBlockingCount: number;
  scaleComplete: boolean;
  nextPhaseLabel: string | null;
  headline: string;
  href: string;
};

export function buildLaunchWizardScaleReadinessConvergenceSlice(
  scaleState: ScaleReadinessConvergenceState,
): LaunchWizardScaleReadinessConvergenceSlice {
  return {
    completedBlockingCount: scaleState.completedBlockingCount,
    totalBlockingCount: scaleState.totalBlockingCount,
    scaleComplete: scaleState.scaleComplete,
    nextPhaseLabel: scaleState.nextPhaseLabel,
    headline: scaleState.scaleComplete
      ? "Scale readiness complete — ready for Series A / partner expansion"
      : scaleState.nextPhaseLabel
        ? `Scale ${scaleState.completedBlockingCount}/${scaleState.totalBlockingCount} — ${scaleState.nextPhaseLabel.replace(/^Gate \d+ — /, "")}`
        : `Scale ${scaleState.completedBlockingCount}/${scaleState.totalBlockingCount} gates in progress`,
    href: "/dashboard/launch-wizard#launch-wizard-commercial-blockers",
  };
}

export function mergeBriefingScaleReadinessConvergenceEra25TopActions(
  scaleConvergenceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!scaleConvergenceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [scaleConvergenceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

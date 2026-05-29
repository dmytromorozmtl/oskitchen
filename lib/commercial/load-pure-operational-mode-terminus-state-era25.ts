/**
 * Loads honest pure operational mode terminus state for era25 final slice.
 */
import type { ContinuousImprovementLoopTrackStatus } from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import { evaluateContinuousImprovementLoop } from "@/scripts/ops/validate-continuous-improvement-loop";
import { evaluateSustainedOperationalExcellenceConvergenceEra25WithMilestones } from "@/scripts/ops/validate-sustained-operational-excellence-convergence-era25";

export type PureOperationalModeTerminusState = {
  goDecision: string | null;
  sustainedOpsConvergenceReady: boolean;
  sustainedOpsComplete: boolean;
  pureOperationalMode: boolean;
  healthyCount: number;
  dueSoonCount: number;
  overdueCount: number;
  guidanceCount: number;
  tracks: readonly ContinuousImprovementLoopTrackStatus[];
  nextAttentionTrackId: string | null;
  nextAttentionTrackLabel: string | null;
  readyForWeeklySmokes: boolean;
  readyForMetricsSmokes: boolean;
  readyForGovernanceSmokes: boolean;
};

export function derivePureOperationalModeTerminusState(
  env: NodeJS.ProcessEnv = process.env,
): PureOperationalModeTerminusState {
  const sustainedOpsConvergence = evaluateSustainedOperationalExcellenceConvergenceEra25WithMilestones(env);
  const improvementLoop = evaluateContinuousImprovementLoop(env);
  const sustainedOpsConvergenceReady =
    sustainedOpsConvergence.sustainedOperationalExcellenceConvergenceEra25Milestone ===
    "sustained_operational_excellence_convergence_era25_ready";

  const attention = improvementLoop.tracks.find(
    (track) => track.status === "overdue" || track.status === "due_soon",
  );

  return {
    goDecision: improvementLoop.goDecision,
    sustainedOpsConvergenceReady,
    sustainedOpsComplete: improvementLoop.sustainedOpsComplete,
    pureOperationalMode: sustainedOpsConvergenceReady && improvementLoop.pureOperationalMode,
    healthyCount: improvementLoop.health.healthyCount,
    dueSoonCount: improvementLoop.health.dueSoonCount,
    overdueCount: improvementLoop.health.overdueCount,
    guidanceCount: improvementLoop.health.guidanceCount,
    tracks: improvementLoop.tracks,
    nextAttentionTrackId: attention?.id ?? null,
    nextAttentionTrackLabel: attention?.label ?? null,
    readyForWeeklySmokes: improvementLoop.readyForWeeklySmokes,
    readyForMetricsSmokes: improvementLoop.readyForMetricsSmokes,
    readyForGovernanceSmokes: improvementLoop.readyForGovernanceSmokes,
  };
}

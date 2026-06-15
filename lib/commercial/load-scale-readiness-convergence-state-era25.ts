/**
 * Loads honest Scale readiness state for era25 convergence.
 */
import type { ScaleReadinessPhaseStatus } from "@/lib/commercial/scale-readiness-phases-era21";
import { evaluateScaleReadinessEnv } from "@/scripts/ops/validate-scale-readiness-env";

export type ScaleReadinessConvergenceState = {
  goDecision: string | null;
  month2Complete: boolean;
  prerequisitesComplete: boolean;
  scaleComplete: boolean;
  readyForResilienceSmokes: boolean;
  completedBlockingCount: number;
  totalBlockingCount: number;
  phases: readonly ScaleReadinessPhaseStatus[];
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  envPresentCount: number;
  envMissingCount: number;
};

export function deriveScaleReadinessConvergenceState(
  env: NodeJS.ProcessEnv = process.env,
): ScaleReadinessConvergenceState {
  const scale = evaluateScaleReadinessEnv(env);
  const blockingPhases = scale.phases.filter((phase) => !phase.optional);
  const completedBlockingCount = blockingPhases.filter((phase) => phase.complete).length;
  const nextPhase =
    scale.phases.find((phase) => !phase.optional && !phase.complete) ??
    scale.phases.find((phase) => !phase.complete) ??
    null;

  return {
    goDecision: scale.goDecision,
    month2Complete: scale.month2Complete,
    prerequisitesComplete: scale.prerequisites.prerequisitesComplete,
    scaleComplete: scale.scaleComplete,
    readyForResilienceSmokes: scale.readyForResilienceSmokes,
    completedBlockingCount,
    totalBlockingCount: blockingPhases.length,
    phases: scale.phases,
    nextPhaseId: nextPhase?.id ?? null,
    nextPhaseLabel: nextPhase?.label ?? null,
    envPresentCount: scale.present.length,
    envMissingCount: scale.missing.length,
  };
}

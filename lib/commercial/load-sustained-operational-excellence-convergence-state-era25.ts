/**
 * Loads honest sustained operational excellence state for era25 convergence.
 */
import type { SustainedOperationalExcellencePhaseStatus } from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import { evaluateSustainedOperationalExcellenceEnv } from "@/scripts/ops/validate-sustained-operational-excellence-env";

export type SustainedOperationalExcellenceConvergenceState = {
  goDecision: string | null;
  marketLeaderComplete: boolean;
  prerequisitesComplete: boolean;
  sustainedOpsComplete: boolean;
  readyForIntegrationSmokes: boolean;
  readyForMetricsSmokes: boolean;
  completedBlockingCount: number;
  totalBlockingCount: number;
  phases: readonly SustainedOperationalExcellencePhaseStatus[];
  nextPhaseId: string | null;
  nextPhaseLabel: string | null;
  envPresentCount: number;
  envMissingCount: number;
};

export function deriveSustainedOperationalExcellenceConvergenceState(
  env: NodeJS.ProcessEnv = process.env,
): SustainedOperationalExcellenceConvergenceState {
  const sustainedOps = evaluateSustainedOperationalExcellenceEnv(env);
  const blockingPhases = sustainedOps.phases.filter((phase) => !phase.optional);
  const completedBlockingCount = blockingPhases.filter((phase) => phase.complete).length;
  const nextPhase =
    sustainedOps.phases.find((phase) => !phase.optional && !phase.complete) ??
    sustainedOps.phases.find((phase) => !phase.complete) ??
    null;

  return {
    goDecision: sustainedOps.goDecision,
    marketLeaderComplete: sustainedOps.marketLeaderComplete,
    prerequisitesComplete: sustainedOps.prerequisites.prerequisitesComplete,
    sustainedOpsComplete: sustainedOps.sustainedOpsComplete,
    readyForIntegrationSmokes: sustainedOps.readyForIntegrationSmokes,
    readyForMetricsSmokes: sustainedOps.readyForMetricsSmokes,
    completedBlockingCount,
    totalBlockingCount: blockingPhases.length,
    phases: sustainedOps.phases,
    nextPhaseId: nextPhase?.id ?? null,
    nextPhaseLabel: nextPhase?.label ?? null,
    envPresentCount: sustainedOps.present.length,
    envMissingCount: sustainedOps.missing.length,
  };
}

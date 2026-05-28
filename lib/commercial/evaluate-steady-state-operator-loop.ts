/**
 * Steady-state operator loop evaluation — Step 14 orchestration.
 */
import {
  buildSteadyStateTrackStatuses,
  resolveSteadyStateHealthSummary,
  resolveSteadyStatePrerequisites,
} from "@/lib/commercial/post-terminus-steady-state-phases-era24";
import { evaluateContinuousImprovementLoop } from "@/scripts/ops/validate-continuous-improvement-loop";
import { evaluateMaintenanceMode } from "@/scripts/ops/validate-maintenance-mode";
import { evaluateSustainedProductEvolution } from "@/scripts/ops/validate-sustained-product-evolution";

export function evaluateSteadyStateOperatorLoop(env: NodeJS.ProcessEnv = process.env): {
  prerequisites: ReturnType<typeof resolveSteadyStatePrerequisites>;
  engineeringTerminusActive: boolean;
  steadyStateActive: boolean;
  goDecision: string | null;
  maintenance: ReturnType<typeof evaluateMaintenanceMode>;
  improvementLoop: ReturnType<typeof evaluateContinuousImprovementLoop>;
  productEvolution: ReturnType<typeof evaluateSustainedProductEvolution>;
  tracks: ReturnType<typeof buildSteadyStateTrackStatuses>;
  health: ReturnType<typeof resolveSteadyStateHealthSummary>;
} {
  const maintenance = evaluateMaintenanceMode(env);
  const improvementLoop = evaluateContinuousImprovementLoop(env);
  const productEvolution = evaluateSustainedProductEvolution(env);

  const engineeringTerminusActive =
    maintenance.maintenanceModeActive && maintenance.commercialPilotPathComplete;
  const prerequisites = resolveSteadyStatePrerequisites({ engineeringTerminusActive });
  const tracks = buildSteadyStateTrackStatuses({
    maintenanceOverdue: maintenance.health.overdueCount,
    maintenanceDueSoon: maintenance.health.dueSoonCount,
    improvementOverdue: improvementLoop.health.overdueCount,
    improvementDueSoon: improvementLoop.health.dueSoonCount,
    productEvolutionOverdue: productEvolution.health.overdueCount,
    productEvolutionDueSoon: productEvolution.health.dueSoonCount,
  });
  const health = resolveSteadyStateHealthSummary(tracks);

  return {
    prerequisites,
    engineeringTerminusActive,
    steadyStateActive: prerequisites.steadyStateActive,
    goDecision: maintenance.goDecision,
    maintenance,
    improvementLoop,
    productEvolution,
    tracks,
    health,
  };
}

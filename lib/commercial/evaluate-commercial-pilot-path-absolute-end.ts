/**
 * Commercial pilot path absolute end evaluation — Step 15 closure orchestration.
 */
import {
  PATH_ABSOLUTE_END_LAYERS,
  resolveCommercialPilotPathAbsoluteEndPrerequisites,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-phases-era24";
import { evaluateCommercialPilotPath } from "@/lib/commercial/evaluate-commercial-pilot-path";
import { evaluateSteadyStateOperatorLoop } from "@/lib/commercial/evaluate-steady-state-operator-loop";

export function evaluateCommercialPilotPathAbsoluteEnd(env: NodeJS.ProcessEnv = process.env): {
  prerequisites: ReturnType<typeof resolveCommercialPilotPathAbsoluteEndPrerequisites>;
  absoluteEndActive: boolean;
  pathEngineeringClosed: boolean;
  goDecision: string | null;
  completedSteps: number;
  totalSteps: number;
  pathLayers: typeof PATH_ABSOLUTE_END_LAYERS;
  path: ReturnType<typeof evaluateCommercialPilotPath>;
  steadyState: ReturnType<typeof evaluateSteadyStateOperatorLoop>;
} {
  const path = evaluateCommercialPilotPath(env);
  const steadyState = evaluateSteadyStateOperatorLoop(env);
  const prerequisites = resolveCommercialPilotPathAbsoluteEndPrerequisites({
    steadyStateActive: steadyState.steadyStateActive,
  });

  return {
    prerequisites,
    absoluteEndActive: prerequisites.absoluteEndActive,
    pathEngineeringClosed: prerequisites.pathEngineeringClosed,
    goDecision: path.summary.goDecision,
    completedSteps: path.summary.completedSteps,
    totalSteps: path.summary.totalSteps,
    pathLayers: PATH_ABSOLUTE_END_LAYERS,
    path,
    steadyState,
  };
}

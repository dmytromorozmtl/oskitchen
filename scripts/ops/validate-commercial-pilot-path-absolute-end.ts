#!/usr/bin/env npx tsx
/**
 * Validates commercial pilot path absolute end (Step 15, informational).
 */
import {
  resolveCommercialPilotPathAbsoluteEndMilestone,
  type CommercialPilotPathAbsoluteEndMilestone,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-post-steady-state-orchestrator-era24";
import { COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_POLICY_ID } from "@/lib/commercial/commercial-pilot-path-absolute-end-era24-policy";
import {
  PATH_ABSOLUTE_END_GUARDRAILS,
  PATH_ABSOLUTE_END_LAYERS,
  STEADY_STATE_PRODUCT_SURFACES,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-phases-era24";
import { evaluateCommercialPilotPathAbsoluteEnd } from "@/lib/commercial/evaluate-commercial-pilot-path-absolute-end";
import { evaluateSteadyStateOperatorLoopWithMilestones } from "@/scripts/ops/validate-steady-state-operator-loop";

export { evaluateCommercialPilotPathAbsoluteEnd };

export function evaluateCommercialPilotPathAbsoluteEndWithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  evaluation: ReturnType<typeof evaluateCommercialPilotPathAbsoluteEnd>;
  steadyState: ReturnType<typeof evaluateSteadyStateOperatorLoopWithMilestones>;
  absoluteEndMilestone: CommercialPilotPathAbsoluteEndMilestone;
  readyForSteadyStateSmokes: boolean;
  readyForPathClosureSmokes: boolean;
} {
  const evaluation = evaluateCommercialPilotPathAbsoluteEnd(env);
  const steadyState = evaluateSteadyStateOperatorLoopWithMilestones(env);
  const absoluteEndMilestone = resolveCommercialPilotPathAbsoluteEndMilestone({
    absoluteEndActive: evaluation.absoluteEndActive,
    steadyStateMilestone: steadyState.steadyStateMilestone,
    firstBlockedStep: evaluation.path.summary.firstBlockedStep,
    firstBlockedGateStep: evaluation.path.summary.firstBlockedGateStep,
  });

  const readyForSteadyStateSmokes =
    !evaluation.absoluteEndActive ||
    steadyState.steadyStateMilestone !== "steady_state_healthy" ||
    evaluation.steadyState.health.overdueCount > 0;
  const readyForPathClosureSmokes = evaluation.path.summary.firstBlockedGateStep !== null;

  return {
    evaluation,
    steadyState,
    absoluteEndMilestone,
    readyForSteadyStateSmokes,
    readyForPathClosureSmokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateCommercialPilotPathAbsoluteEndWithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_POLICY_ID,
          absoluteEndActive: result.evaluation.absoluteEndActive,
          pathEngineeringClosed: result.evaluation.pathEngineeringClosed,
          goDecision: result.evaluation.goDecision,
          completedSteps: result.evaluation.completedSteps,
          totalSteps: result.evaluation.totalSteps,
          absoluteEndMilestone: result.absoluteEndMilestone,
          steadyStateMilestone: result.steadyState.steadyStateMilestone,
          engineeringPathTerminusMilestone:
            result.steadyState.pathEvaluation.engineeringPathTerminusMilestone,
          sustainedOpsConvergenceReady:
            result.steadyState.pathEvaluation.maintenanceMode.prerequisites
              .sustainedOpsConvergenceReady,
          pureOperationalModeEra25Active:
            result.steadyState.pathEvaluation.maintenanceMode.prerequisites
              .pureOperationalModeEra25Active,
          productEvolutionReady:
            result.steadyState.pathEvaluation.maintenanceMode.prerequisites.productEvolutionReady,
          maintenanceModeMilestone:
            result.steadyState.pathEvaluation.maintenanceMode.maintenanceModeMilestone,
          readyForSteadyStateSmokes: result.readyForSteadyStateSmokes,
          readyForPathClosureSmokes: result.readyForPathClosureSmokes,
          pathLayers: PATH_ABSOLUTE_END_LAYERS,
          productSurfaces: STEADY_STATE_PRODUCT_SURFACES.map((surface) => ({
            id: surface.id,
            route: surface.route,
            rhythm: surface.rhythm,
          })),
          guardrails: PATH_ABSOLUTE_END_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(
    `\nCommercial pilot path absolute end (${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA24_POLICY_ID})\n`,
  );

  if (!result.evaluation.absoluteEndActive) {
    console.log("Path absolute end not active — complete Step 14 steady state first.\n");
    console.log(`  steadyStateActive: ${result.evaluation.steadyState.steadyStateActive}`);
    console.log(`  completedSteps: ${result.evaluation.completedSteps}/${result.evaluation.totalSteps}\n`);
    process.exit(0);
  }

  console.log(`Absolute end milestone: ${result.absoluteEndMilestone}\n`);
  console.log("Linear commercial pilot path engineering CLOSED.\n");
  console.log(`Progress: ${result.evaluation.completedSteps}/${result.evaluation.totalSteps} steps`);
  console.log(`GO decision: ${result.evaluation.goDecision ?? "missing"}`);
  console.log("era25+ requires explicit era charter.\n");

  for (const layer of PATH_ABSOLUTE_END_LAYERS) {
    console.log(`  Step ${layer.step} — ${layer.label} (${layer.role})`);
  }

  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

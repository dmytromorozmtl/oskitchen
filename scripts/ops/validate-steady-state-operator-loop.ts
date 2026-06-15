#!/usr/bin/env npx tsx
/**
 * Validates steady-state operator loop (Step 14, informational — never blocks release).
 */
import {
  resolvePostTerminusSteadyStateMilestone,
  type PostTerminusSteadyStateMilestone,
} from "@/lib/commercial/post-terminus-steady-state-post-engineering-terminus-orchestrator-era24";
import { POST_TERMINUS_STEADY_STATE_ERA24_POLICY_ID } from "@/lib/commercial/post-terminus-steady-state-era24-policy";
import {
  POST_TERMINUS_STEADY_STATE_GUARDRAILS,
  STEADY_STATE_RELEASE_TRAIN,
} from "@/lib/commercial/post-terminus-steady-state-phases-era24";
import { evaluateSteadyStateOperatorLoop } from "@/lib/commercial/evaluate-steady-state-operator-loop";
import { evaluateCommercialPilotPathWithMilestones } from "@/scripts/ops/validate-commercial-pilot-path";

export { evaluateSteadyStateOperatorLoop };

export function evaluateSteadyStateOperatorLoopWithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  evaluation: ReturnType<typeof evaluateSteadyStateOperatorLoop>;
  pathEvaluation: ReturnType<typeof evaluateCommercialPilotPathWithMilestones>;
  steadyStateMilestone: PostTerminusSteadyStateMilestone;
  readyForMaintenanceRhythmSmokes: boolean;
  readyForUpstreamLoopSmokes: boolean;
} {
  const evaluation = evaluateSteadyStateOperatorLoop(env);
  const pathEvaluation = evaluateCommercialPilotPathWithMilestones(env);
  const steadyStateMilestone = resolvePostTerminusSteadyStateMilestone({
    steadyStateActive: evaluation.steadyStateActive,
    engineeringPathTerminusMilestone: pathEvaluation.engineeringPathTerminusMilestone,
    tracks: evaluation.tracks,
  });

  const maintenanceTrack = evaluation.tracks.find((track) => track.id === "weekly_maintenance");
  const improvementTrack = evaluation.tracks.find(
    (track) => track.id === "weekly_improvement_loop",
  );
  const evolutionTrack = evaluation.tracks.find(
    (track) => track.id === "weekly_product_evolution",
  );

  const readyForMaintenanceRhythmSmokes =
    evaluation.steadyStateActive &&
    (maintenanceTrack?.status === "overdue" ||
      evaluation.maintenance.maintenanceModeMilestone !== "maintenance_mode_healthy");
  const readyForUpstreamLoopSmokes =
    evaluation.steadyStateActive &&
    (improvementTrack?.status === "overdue" || evolutionTrack?.status === "overdue");

  return {
    evaluation,
    pathEvaluation,
    steadyStateMilestone,
    readyForMaintenanceRhythmSmokes,
    readyForUpstreamLoopSmokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateSteadyStateOperatorLoopWithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: POST_TERMINUS_STEADY_STATE_ERA24_POLICY_ID,
          steadyStateActive: result.evaluation.steadyStateActive,
          engineeringTerminusActive: result.evaluation.engineeringTerminusActive,
          goDecision: result.evaluation.goDecision,
          steadyStateMilestone: result.steadyStateMilestone,
          engineeringPathTerminusMilestone: result.pathEvaluation.engineeringPathTerminusMilestone,
          sustainedOpsConvergenceReady:
            result.pathEvaluation.maintenanceMode.prerequisites.sustainedOpsConvergenceReady,
          pureOperationalModeEra25Active:
            result.pathEvaluation.maintenanceMode.prerequisites.pureOperationalModeEra25Active,
          productEvolutionReady:
            result.pathEvaluation.maintenanceMode.prerequisites.productEvolutionReady,
          maintenanceModeMilestone: result.pathEvaluation.maintenanceMode.maintenanceModeMilestone,
          readyForMaintenanceRhythmSmokes: result.readyForMaintenanceRhythmSmokes,
          readyForUpstreamLoopSmokes: result.readyForUpstreamLoopSmokes,
          health: result.evaluation.health,
          releaseTrain: STEADY_STATE_RELEASE_TRAIN,
          tracks: result.evaluation.tracks.map((track) => ({
            id: track.id,
            label: track.label,
            ownerRole: track.ownerRole,
            frequency: track.frequency,
            status: track.status,
            detail: track.detail,
          })),
          guardrails: POST_TERMINUS_STEADY_STATE_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(`\nSteady-state operator loop (${POST_TERMINUS_STEADY_STATE_ERA24_POLICY_ID})\n`);

  if (!result.evaluation.steadyStateActive) {
    console.log("Not in steady state — complete Step 13 engineering path terminus first.\n");
    console.log(`  engineeringTerminusActive: ${result.evaluation.engineeringTerminusActive}`);
    console.log(`  goDecision: ${result.evaluation.goDecision ?? "missing"}\n`);
    process.exit(0);
  }

  console.log(`Steady state milestone: ${result.steadyStateMilestone}\n`);
  console.log("Post-terminus steady state — repeat Step 12 rhythms forever.\n");

  for (const track of result.evaluation.tracks) {
    console.log(`[${track.status}] ${track.label} (${track.ownerRole})`);
    console.log(`  ${track.detail}\n`);
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

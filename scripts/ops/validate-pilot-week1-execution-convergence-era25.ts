#!/usr/bin/env npx tsx
import {
  resolvePilotWeek1ExecutionConvergenceEra25Milestone,
  type PilotWeek1ExecutionConvergenceEra25Milestone,
} from "@/lib/commercial/pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25";
import { PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_POLICY_ID } from "@/lib/commercial/pilot-week1-execution-convergence-era25-policy";
import {
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_GUARDRAILS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_HUMAN_STEPS,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
} from "@/lib/commercial/pilot-week1-execution-convergence-phases-era25";
import { evaluatePilotWeek1ExecutionConvergenceEra25 } from "@/lib/commercial/evaluate-pilot-week1-execution-convergence-era25";

export { evaluatePilotWeek1ExecutionConvergenceEra25 };

export function evaluatePilotWeek1ExecutionConvergenceEra25WithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  evaluation: ReturnType<typeof evaluatePilotWeek1ExecutionConvergenceEra25>;
  pilotWeek1ExecutionConvergenceEra25Milestone: PilotWeek1ExecutionConvergenceEra25Milestone;
  readyForGoConvergenceRegressionSmokes: boolean;
  readyForDay5Smokes: boolean;
} {
  const evaluation = evaluatePilotWeek1ExecutionConvergenceEra25(env);
  const pilotWeek1ExecutionConvergenceEra25Milestone =
    resolvePilotWeek1ExecutionConvergenceEra25Milestone({
      paidPilotGoConvergenceEra25Milestone:
        evaluation.goConvergence.paidPilotGoConvergenceEra25Milestone,
      week1Complete: evaluation.week1State.week1Complete,
      nextPhaseId: evaluation.week1State.nextPhaseId,
    });

  const readyForGoConvergenceRegressionSmokes =
    evaluation.goConvergence.paidPilotGoConvergenceEra25Milestone !==
    "paid_pilot_go_convergence_era25_ready";
  const readyForDay5Smokes = evaluation.week1State.readyForDay5Smokes;

  return {
    evaluation,
    pilotWeek1ExecutionConvergenceEra25Milestone,
    readyForGoConvergenceRegressionSmokes,
    readyForDay5Smokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluatePilotWeek1ExecutionConvergenceEra25WithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_POLICY_ID,
          outsideLinearCatalog: true,
          pilotWeek1ExecutionConvergenceEra25Milestone:
            result.pilotWeek1ExecutionConvergenceEra25Milestone,
          paidPilotGoConvergenceEra25Milestone:
            result.evaluation.goConvergence.paidPilotGoConvergenceEra25Milestone,
          convergenceBlocked: result.evaluation.convergenceBlocked,
          goConvergenceReady: result.evaluation.goConvergenceReady,
          week1Complete: result.evaluation.week1State.week1Complete,
          completedPhaseCount: result.evaluation.week1State.completedPhaseCount,
          totalPhaseCount: result.evaluation.week1State.totalPhaseCount,
          nextPhaseId: result.evaluation.week1State.nextPhaseId,
          readyForGoConvergenceRegressionSmokes: result.readyForGoConvergenceRegressionSmokes,
          readyForDay5Smokes: result.readyForDay5Smokes,
          convergenceTargets: PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
          humanSteps: PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_HUMAN_STEPS,
          guardrails: PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(
    `\nera25 pilot week 1 execution convergence (${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${result.pilotWeek1ExecutionConvergenceEra25Milestone}`);
  console.log(`Convergence blocked: ${result.evaluation.convergenceBlocked ? "yes" : "no"}`);
  console.log(
    `Progress: ${result.evaluation.week1State.completedPhaseCount}/${result.evaluation.week1State.totalPhaseCount} days`,
  );
  console.log("");
  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

#!/usr/bin/env npx tsx
import {
  resolveScaleReadinessConvergenceEra25Milestone,
  type ScaleReadinessConvergenceEra25Milestone,
} from "@/lib/commercial/scale-readiness-convergence-post-month2-convergence-orchestrator-era25";
import { SCALE_READINESS_CONVERGENCE_ERA25_POLICY_ID } from "@/lib/commercial/scale-readiness-convergence-era25-policy";
import {
  SCALE_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
  SCALE_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
  SCALE_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
} from "@/lib/commercial/scale-readiness-convergence-phases-era25";
import { evaluateScaleReadinessConvergenceEra25 } from "@/lib/commercial/evaluate-scale-readiness-convergence-era25";

export { evaluateScaleReadinessConvergenceEra25 };

export function evaluateScaleReadinessConvergenceEra25WithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  evaluation: ReturnType<typeof evaluateScaleReadinessConvergenceEra25>;
  scaleReadinessConvergenceEra25Milestone: ScaleReadinessConvergenceEra25Milestone;
  readyForMonth2ConvergenceRegressionSmokes: boolean;
  readyForResilienceSmokes: boolean;
} {
  const evaluation = evaluateScaleReadinessConvergenceEra25(env);
  const scaleReadinessConvergenceEra25Milestone = resolveScaleReadinessConvergenceEra25Milestone({
    month2MarketReadinessConvergenceEra25Milestone:
      evaluation.month2Convergence.month2MarketReadinessConvergenceEra25Milestone,
    scaleComplete: evaluation.scaleState.scaleComplete,
    phases: evaluation.scaleState.phases,
  });

  const readyForMonth2ConvergenceRegressionSmokes =
    evaluation.month2Convergence.month2MarketReadinessConvergenceEra25Milestone !==
    "month2_market_readiness_convergence_era25_ready";
  const readyForResilienceSmokes = evaluation.scaleState.readyForResilienceSmokes;

  return {
    evaluation,
    scaleReadinessConvergenceEra25Milestone,
    readyForMonth2ConvergenceRegressionSmokes,
    readyForResilienceSmokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateScaleReadinessConvergenceEra25WithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: SCALE_READINESS_CONVERGENCE_ERA25_POLICY_ID,
          outsideLinearCatalog: true,
          scaleReadinessConvergenceEra25Milestone: result.scaleReadinessConvergenceEra25Milestone,
          month2MarketReadinessConvergenceEra25Milestone:
            result.evaluation.month2Convergence.month2MarketReadinessConvergenceEra25Milestone,
          convergenceBlocked: result.evaluation.convergenceBlocked,
          month2ConvergenceReady: result.evaluation.month2ConvergenceReady,
          scaleComplete: result.evaluation.scaleState.scaleComplete,
          completedBlockingCount: result.evaluation.scaleState.completedBlockingCount,
          totalBlockingCount: result.evaluation.scaleState.totalBlockingCount,
          nextPhaseId: result.evaluation.scaleState.nextPhaseId,
          goDecision: result.evaluation.scaleState.goDecision,
          readyForMonth2ConvergenceRegressionSmokes: result.readyForMonth2ConvergenceRegressionSmokes,
          readyForResilienceSmokes: result.readyForResilienceSmokes,
          convergenceTargets: SCALE_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
          humanSteps: SCALE_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
          guardrails: SCALE_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(
    `\nera25 scale readiness convergence (${SCALE_READINESS_CONVERGENCE_ERA25_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${result.scaleReadinessConvergenceEra25Milestone}`);
  console.log(`Convergence blocked: ${result.evaluation.convergenceBlocked ? "yes" : "no"}`);
  console.log(
    `Progress: ${result.evaluation.scaleState.completedBlockingCount}/${result.evaluation.scaleState.totalBlockingCount} gates`,
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

#!/usr/bin/env npx tsx
import {
  resolveSustainedOperationalExcellenceConvergenceEra25Milestone,
  type SustainedOperationalExcellenceConvergenceEra25Milestone,
} from "@/lib/commercial/sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25";
import { SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POLICY_ID } from "@/lib/commercial/sustained-operational-excellence-convergence-era25-policy";
import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_GUARDRAILS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_HUMAN_STEPS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
} from "@/lib/commercial/sustained-operational-excellence-convergence-phases-era25";
import { evaluateSustainedOperationalExcellenceConvergenceEra25 } from "@/lib/commercial/evaluate-sustained-operational-excellence-convergence-era25";

export { evaluateSustainedOperationalExcellenceConvergenceEra25 };

export function evaluateSustainedOperationalExcellenceConvergenceEra25WithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  evaluation: ReturnType<typeof evaluateSustainedOperationalExcellenceConvergenceEra25>;
  sustainedOperationalExcellenceConvergenceEra25Milestone: SustainedOperationalExcellenceConvergenceEra25Milestone;
  readyForMarketLeaderConvergenceRegressionSmokes: boolean;
  readyForIntegrationSmokes: boolean;
  readyForMetricsSmokes: boolean;
} {
  const evaluation = evaluateSustainedOperationalExcellenceConvergenceEra25(env);
  const sustainedOperationalExcellenceConvergenceEra25Milestone =
    resolveSustainedOperationalExcellenceConvergenceEra25Milestone({
      marketLeaderPositioningConvergenceEra25Milestone:
        evaluation.marketLeaderConvergence.marketLeaderPositioningConvergenceEra25Milestone,
      sustainedOpsComplete: evaluation.sustainedOpsState.sustainedOpsComplete,
      phases: evaluation.sustainedOpsState.phases,
    });

  const readyForMarketLeaderConvergenceRegressionSmokes =
    evaluation.marketLeaderConvergence.marketLeaderPositioningConvergenceEra25Milestone !==
    "market_leader_positioning_convergence_era25_ready";
  const readyForIntegrationSmokes = evaluation.sustainedOpsState.readyForIntegrationSmokes;
  const readyForMetricsSmokes = evaluation.sustainedOpsState.readyForMetricsSmokes;

  return {
    evaluation,
    sustainedOperationalExcellenceConvergenceEra25Milestone,
    readyForMarketLeaderConvergenceRegressionSmokes,
    readyForIntegrationSmokes,
    readyForMetricsSmokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateSustainedOperationalExcellenceConvergenceEra25WithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POLICY_ID,
          outsideLinearCatalog: true,
          sustainedOperationalExcellenceConvergenceEra25Milestone:
            result.sustainedOperationalExcellenceConvergenceEra25Milestone,
          marketLeaderPositioningConvergenceEra25Milestone:
            result.evaluation.marketLeaderConvergence.marketLeaderPositioningConvergenceEra25Milestone,
          convergenceBlocked: result.evaluation.convergenceBlocked,
          marketLeaderConvergenceReady: result.evaluation.marketLeaderConvergenceReady,
          sustainedOpsComplete: result.evaluation.sustainedOpsState.sustainedOpsComplete,
          completedBlockingCount: result.evaluation.sustainedOpsState.completedBlockingCount,
          totalBlockingCount: result.evaluation.sustainedOpsState.totalBlockingCount,
          nextPhaseId: result.evaluation.sustainedOpsState.nextPhaseId,
          goDecision: result.evaluation.sustainedOpsState.goDecision,
          readyForMarketLeaderConvergenceRegressionSmokes:
            result.readyForMarketLeaderConvergenceRegressionSmokes,
          readyForIntegrationSmokes: result.readyForIntegrationSmokes,
          readyForMetricsSmokes: result.readyForMetricsSmokes,
          convergenceTargets: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
          humanSteps: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_HUMAN_STEPS,
          guardrails: SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(
    `\nera25 sustained operational excellence convergence (${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${result.sustainedOperationalExcellenceConvergenceEra25Milestone}`);
  console.log(`Convergence blocked: ${result.evaluation.convergenceBlocked ? "yes" : "no"}`);
  console.log(
    `Progress: ${result.evaluation.sustainedOpsState.completedBlockingCount}/${result.evaluation.sustainedOpsState.totalBlockingCount} cadences`,
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

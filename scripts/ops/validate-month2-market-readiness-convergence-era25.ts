#!/usr/bin/env npx tsx
import {
  resolveMonth2MarketReadinessConvergenceEra25Milestone,
  type Month2MarketReadinessConvergenceEra25Milestone,
} from "@/lib/commercial/month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25";
import { MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_POLICY_ID } from "@/lib/commercial/month2-market-readiness-convergence-era25-policy";
import {
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
} from "@/lib/commercial/month2-market-readiness-convergence-phases-era25";
import { evaluateMonth2MarketReadinessConvergenceEra25 } from "@/lib/commercial/evaluate-month2-market-readiness-convergence-era25";

export { evaluateMonth2MarketReadinessConvergenceEra25 };

export function evaluateMonth2MarketReadinessConvergenceEra25WithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  evaluation: ReturnType<typeof evaluateMonth2MarketReadinessConvergenceEra25>;
  month2MarketReadinessConvergenceEra25Milestone: Month2MarketReadinessConvergenceEra25Milestone;
  readyForWeek1ConvergenceRegressionSmokes: boolean;
  readyForInvestorOnepagerSmoke: boolean;
} {
  const evaluation = evaluateMonth2MarketReadinessConvergenceEra25(env);
  const month2MarketReadinessConvergenceEra25Milestone =
    resolveMonth2MarketReadinessConvergenceEra25Milestone({
      pilotWeek1ExecutionConvergenceEra25Milestone:
        evaluation.week1Convergence.pilotWeek1ExecutionConvergenceEra25Milestone,
      month2Complete: evaluation.month2State.month2Complete,
      metricsBaselinePassed: evaluation.month2State.metricsBaselinePassed,
      phases: evaluation.month2State.phases,
    });

  const readyForWeek1ConvergenceRegressionSmokes =
    evaluation.week1Convergence.pilotWeek1ExecutionConvergenceEra25Milestone !==
    "pilot_week1_execution_convergence_era25_ready";
  const readyForInvestorOnepagerSmoke = evaluation.month2State.readyForInvestorOnepagerSmoke;

  return {
    evaluation,
    month2MarketReadinessConvergenceEra25Milestone,
    readyForWeek1ConvergenceRegressionSmokes,
    readyForInvestorOnepagerSmoke,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateMonth2MarketReadinessConvergenceEra25WithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_POLICY_ID,
          outsideLinearCatalog: true,
          month2MarketReadinessConvergenceEra25Milestone:
            result.month2MarketReadinessConvergenceEra25Milestone,
          pilotWeek1ExecutionConvergenceEra25Milestone:
            result.evaluation.week1Convergence.pilotWeek1ExecutionConvergenceEra25Milestone,
          convergenceBlocked: result.evaluation.convergenceBlocked,
          week1ConvergenceReady: result.evaluation.week1ConvergenceReady,
          month2Complete: result.evaluation.month2State.month2Complete,
          completedBlockingCount: result.evaluation.month2State.completedBlockingCount,
          totalBlockingCount: result.evaluation.month2State.totalBlockingCount,
          nextPhaseId: result.evaluation.month2State.nextPhaseId,
          metricsBaselinePassed: result.evaluation.month2State.metricsBaselinePassed,
          readyForWeek1ConvergenceRegressionSmokes: result.readyForWeek1ConvergenceRegressionSmokes,
          readyForInvestorOnepagerSmoke: result.readyForInvestorOnepagerSmoke,
          convergenceTargets: MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
          humanSteps: MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_HUMAN_STEPS,
          guardrails: MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(
    `\nera25 month 2 market readiness convergence (${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${result.month2MarketReadinessConvergenceEra25Milestone}`);
  console.log(`Convergence blocked: ${result.evaluation.convergenceBlocked ? "yes" : "no"}`);
  console.log(
    `Progress: ${result.evaluation.month2State.completedBlockingCount}/${result.evaluation.month2State.totalBlockingCount} workstreams`,
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

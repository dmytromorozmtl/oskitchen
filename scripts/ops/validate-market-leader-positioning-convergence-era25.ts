#!/usr/bin/env npx tsx
import {
  resolveMarketLeaderPositioningConvergenceEra25Milestone,
  type MarketLeaderPositioningConvergenceEra25Milestone,
} from "@/lib/commercial/market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25";
import { MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_POLICY_ID } from "@/lib/commercial/market-leader-positioning-convergence-era25-policy";
import {
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_GUARDRAILS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_HUMAN_STEPS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
} from "@/lib/commercial/market-leader-positioning-convergence-phases-era25";
import { evaluateMarketLeaderPositioningConvergenceEra25 } from "@/lib/commercial/evaluate-market-leader-positioning-convergence-era25";

export { evaluateMarketLeaderPositioningConvergenceEra25 };

export function evaluateMarketLeaderPositioningConvergenceEra25WithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  evaluation: ReturnType<typeof evaluateMarketLeaderPositioningConvergenceEra25>;
  marketLeaderPositioningConvergenceEra25Milestone: MarketLeaderPositioningConvergenceEra25Milestone;
  readyForSeriesAConvergenceRegressionSmokes: boolean;
  readyForMoatSmokes: boolean;
  readyForAnalystKitSmokes: boolean;
} {
  const evaluation = evaluateMarketLeaderPositioningConvergenceEra25(env);
  const marketLeaderPositioningConvergenceEra25Milestone =
    resolveMarketLeaderPositioningConvergenceEra25Milestone({
      seriesAPartnerExpansionConvergenceEra25Milestone:
        evaluation.seriesAConvergence.seriesAPartnerExpansionConvergenceEra25Milestone,
      marketLeaderComplete: evaluation.marketLeaderState.marketLeaderComplete,
      phases: evaluation.marketLeaderState.phases,
    });

  const readyForSeriesAConvergenceRegressionSmokes =
    evaluation.seriesAConvergence.seriesAPartnerExpansionConvergenceEra25Milestone !==
    "series_a_partner_expansion_convergence_era25_ready";
  const readyForMoatSmokes = evaluation.marketLeaderState.readyForMoatSmokes;
  const readyForAnalystKitSmokes = evaluation.marketLeaderState.readyForAnalystKitSmokes;

  return {
    evaluation,
    marketLeaderPositioningConvergenceEra25Milestone,
    readyForSeriesAConvergenceRegressionSmokes,
    readyForMoatSmokes,
    readyForAnalystKitSmokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateMarketLeaderPositioningConvergenceEra25WithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_POLICY_ID,
          outsideLinearCatalog: true,
          marketLeaderPositioningConvergenceEra25Milestone:
            result.marketLeaderPositioningConvergenceEra25Milestone,
          seriesAPartnerExpansionConvergenceEra25Milestone:
            result.evaluation.seriesAConvergence.seriesAPartnerExpansionConvergenceEra25Milestone,
          convergenceBlocked: result.evaluation.convergenceBlocked,
          seriesAConvergenceReady: result.evaluation.seriesAConvergenceReady,
          marketLeaderComplete: result.evaluation.marketLeaderState.marketLeaderComplete,
          completedBlockingCount: result.evaluation.marketLeaderState.completedBlockingCount,
          totalBlockingCount: result.evaluation.marketLeaderState.totalBlockingCount,
          nextPhaseId: result.evaluation.marketLeaderState.nextPhaseId,
          goDecision: result.evaluation.marketLeaderState.goDecision,
          readyForSeriesAConvergenceRegressionSmokes:
            result.readyForSeriesAConvergenceRegressionSmokes,
          readyForMoatSmokes: result.readyForMoatSmokes,
          readyForAnalystKitSmokes: result.readyForAnalystKitSmokes,
          convergenceTargets: MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
          humanSteps: MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_HUMAN_STEPS,
          guardrails: MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(
    `\nera25 market leader positioning convergence (${MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${result.marketLeaderPositioningConvergenceEra25Milestone}`);
  console.log(`Convergence blocked: ${result.evaluation.convergenceBlocked ? "yes" : "no"}`);
  console.log(
    `Progress: ${result.evaluation.marketLeaderState.completedBlockingCount}/${result.evaluation.marketLeaderState.totalBlockingCount} pillars`,
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

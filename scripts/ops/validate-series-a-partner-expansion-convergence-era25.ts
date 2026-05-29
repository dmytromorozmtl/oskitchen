#!/usr/bin/env npx tsx
import {
  resolveSeriesAPartnerExpansionConvergenceEra25Milestone,
  type SeriesAPartnerExpansionConvergenceEra25Milestone,
} from "@/lib/commercial/series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25";
import { SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_POLICY_ID } from "@/lib/commercial/series-a-partner-expansion-convergence-era25-policy";
import {
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_GUARDRAILS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_HUMAN_STEPS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
} from "@/lib/commercial/series-a-partner-expansion-convergence-phases-era25";
import { evaluateSeriesAPartnerExpansionConvergenceEra25 } from "@/lib/commercial/evaluate-series-a-partner-expansion-convergence-era25";

export { evaluateSeriesAPartnerExpansionConvergenceEra25 };

export function evaluateSeriesAPartnerExpansionConvergenceEra25WithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  evaluation: ReturnType<typeof evaluateSeriesAPartnerExpansionConvergenceEra25>;
  seriesAPartnerExpansionConvergenceEra25Milestone: SeriesAPartnerExpansionConvergenceEra25Milestone;
  readyForScaleConvergenceRegressionSmokes: boolean;
  readyForDataRoomSmokes: boolean;
  readyForPartnerSmokes: boolean;
} {
  const evaluation = evaluateSeriesAPartnerExpansionConvergenceEra25(env);
  const seriesAPartnerExpansionConvergenceEra25Milestone =
    resolveSeriesAPartnerExpansionConvergenceEra25Milestone({
      scaleReadinessConvergenceEra25Milestone:
        evaluation.scaleConvergence.scaleReadinessConvergenceEra25Milestone,
      seriesAComplete: evaluation.seriesAState.seriesAComplete,
      phases: evaluation.seriesAState.phases,
    });

  const readyForScaleConvergenceRegressionSmokes =
    evaluation.scaleConvergence.scaleReadinessConvergenceEra25Milestone !==
    "scale_readiness_convergence_era25_ready";
  const readyForDataRoomSmokes = evaluation.seriesAState.readyForDataRoomSmokes;
  const readyForPartnerSmokes = evaluation.seriesAState.readyForPartnerSmokes;

  return {
    evaluation,
    seriesAPartnerExpansionConvergenceEra25Milestone,
    readyForScaleConvergenceRegressionSmokes,
    readyForDataRoomSmokes,
    readyForPartnerSmokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateSeriesAPartnerExpansionConvergenceEra25WithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_POLICY_ID,
          outsideLinearCatalog: true,
          seriesAPartnerExpansionConvergenceEra25Milestone:
            result.seriesAPartnerExpansionConvergenceEra25Milestone,
          scaleReadinessConvergenceEra25Milestone:
            result.evaluation.scaleConvergence.scaleReadinessConvergenceEra25Milestone,
          convergenceBlocked: result.evaluation.convergenceBlocked,
          scaleConvergenceReady: result.evaluation.scaleConvergenceReady,
          seriesAComplete: result.evaluation.seriesAState.seriesAComplete,
          completedBlockingCount: result.evaluation.seriesAState.completedBlockingCount,
          totalBlockingCount: result.evaluation.seriesAState.totalBlockingCount,
          nextPhaseId: result.evaluation.seriesAState.nextPhaseId,
          goDecision: result.evaluation.seriesAState.goDecision,
          readyForScaleConvergenceRegressionSmokes: result.readyForScaleConvergenceRegressionSmokes,
          readyForDataRoomSmokes: result.readyForDataRoomSmokes,
          readyForPartnerSmokes: result.readyForPartnerSmokes,
          convergenceTargets: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
          humanSteps: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_HUMAN_STEPS,
          guardrails: SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(
    `\nera25 series a partner expansion convergence (${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${result.seriesAPartnerExpansionConvergenceEra25Milestone}`);
  console.log(`Convergence blocked: ${result.evaluation.convergenceBlocked ? "yes" : "no"}`);
  console.log(
    `Progress: ${result.evaluation.seriesAState.completedBlockingCount}/${result.evaluation.seriesAState.totalBlockingCount} tracks`,
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

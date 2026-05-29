#!/usr/bin/env npx tsx
import {
  resolvePureOperationalModeTerminusEra25Milestone,
  type PureOperationalModeTerminusEra25Milestone,
} from "@/lib/commercial/pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25";
import { PURE_OPERATIONAL_MODE_TERMINUS_ERA25_POLICY_ID } from "@/lib/commercial/pure-operational-mode-terminus-era25-policy";
import {
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_GUARDRAILS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_HUMAN_STEPS,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_CONVERGENCE_TARGETS,
} from "@/lib/commercial/pure-operational-mode-terminus-phases-era25";
import { evaluatePureOperationalModeTerminusEra25 } from "@/lib/commercial/evaluate-pure-operational-mode-terminus-era25";

export { evaluatePureOperationalModeTerminusEra25 };

export function evaluatePureOperationalModeTerminusEra25WithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  evaluation: ReturnType<typeof evaluatePureOperationalModeTerminusEra25>;
  pureOperationalModeTerminusEra25Milestone: PureOperationalModeTerminusEra25Milestone;
  readyForSustainedOpsConvergenceRegressionSmokes: boolean;
  readyForWeeklySmokes: boolean;
  readyForMetricsSmokes: boolean;
  readyForGovernanceSmokes: boolean;
} {
  const evaluation = evaluatePureOperationalModeTerminusEra25(env);
  const pureOperationalModeTerminusEra25Milestone = resolvePureOperationalModeTerminusEra25Milestone({
    sustainedOperationalExcellenceConvergenceEra25Milestone:
      evaluation.sustainedOpsConvergence.sustainedOperationalExcellenceConvergenceEra25Milestone,
    sustainedOpsConvergenceReady: evaluation.sustainedOpsConvergenceReady,
    tracks: evaluation.terminusState.tracks,
  });

  const readyForSustainedOpsConvergenceRegressionSmokes =
    evaluation.sustainedOpsConvergence.sustainedOperationalExcellenceConvergenceEra25Milestone !==
    "sustained_operational_excellence_convergence_era25_ready";
  const readyForWeeklySmokes = evaluation.terminusState.readyForWeeklySmokes;
  const readyForMetricsSmokes = evaluation.terminusState.readyForMetricsSmokes;
  const readyForGovernanceSmokes = evaluation.terminusState.readyForGovernanceSmokes;

  return {
    evaluation,
    pureOperationalModeTerminusEra25Milestone,
    readyForSustainedOpsConvergenceRegressionSmokes,
    readyForWeeklySmokes,
    readyForMetricsSmokes,
    readyForGovernanceSmokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluatePureOperationalModeTerminusEra25WithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: PURE_OPERATIONAL_MODE_TERMINUS_ERA25_POLICY_ID,
          outsideLinearCatalog: true,
          pureOperationalModeTerminusEra25Milestone: result.pureOperationalModeTerminusEra25Milestone,
          sustainedOperationalExcellenceConvergenceEra25Milestone:
            result.evaluation.sustainedOpsConvergence.sustainedOperationalExcellenceConvergenceEra25Milestone,
          terminusBlocked: result.evaluation.terminusBlocked,
          sustainedOpsConvergenceReady: result.evaluation.sustainedOpsConvergenceReady,
          pureOperationalModeEra25Active: result.evaluation.pureOperationalModeEra25Active,
          healthyCount: result.evaluation.terminusState.healthyCount,
          overdueCount: result.evaluation.terminusState.overdueCount,
          dueSoonCount: result.evaluation.terminusState.dueSoonCount,
          nextAttentionTrackLabel: result.evaluation.terminusState.nextAttentionTrackLabel,
          readyForSustainedOpsConvergenceRegressionSmokes:
            result.readyForSustainedOpsConvergenceRegressionSmokes,
          readyForWeeklySmokes: result.readyForWeeklySmokes,
          readyForMetricsSmokes: result.readyForMetricsSmokes,
          readyForGovernanceSmokes: result.readyForGovernanceSmokes,
          convergenceTargets: PURE_OPERATIONAL_MODE_TERMINUS_ERA25_CONVERGENCE_TARGETS,
          humanSteps: PURE_OPERATIONAL_MODE_TERMINUS_ERA25_HUMAN_STEPS,
          guardrails: PURE_OPERATIONAL_MODE_TERMINUS_ERA25_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(
    `\nera25 pure operational mode terminus (${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${result.pureOperationalModeTerminusEra25Milestone}`);
  console.log(`Terminus blocked: ${result.evaluation.terminusBlocked ? "yes" : "no"}`);
  console.log(
    `Track health: ${result.evaluation.terminusState.healthyCount}/${result.evaluation.terminusState.tracks.length} fresh`,
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

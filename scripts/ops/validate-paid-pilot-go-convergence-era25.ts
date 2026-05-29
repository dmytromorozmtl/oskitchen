#!/usr/bin/env npx tsx
import {
  resolvePaidPilotGoConvergenceEra25Milestone,
  type PaidPilotGoConvergenceEra25Milestone,
} from "@/lib/commercial/paid-pilot-go-convergence-post-breakthrough-orchestrator-era25";
import { PAID_PILOT_GO_CONVERGENCE_ERA25_POLICY_ID } from "@/lib/commercial/paid-pilot-go-convergence-era25-policy";
import {
  PAID_PILOT_GO_CONVERGENCE_ERA25_GUARDRAILS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_HUMAN_STEPS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
} from "@/lib/commercial/paid-pilot-go-convergence-phases-era25";
import { evaluatePaidPilotGoConvergenceEra25 } from "@/lib/commercial/evaluate-paid-pilot-go-convergence-era25";

export { evaluatePaidPilotGoConvergenceEra25 };

export function evaluatePaidPilotGoConvergenceEra25WithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  evaluation: ReturnType<typeof evaluatePaidPilotGoConvergenceEra25>;
  paidPilotGoConvergenceEra25Milestone: PaidPilotGoConvergenceEra25Milestone;
  readyForBreakthroughRegressionSmokes: boolean;
  readyForIcpSmokes: boolean;
  readyForLoiSmokes: boolean;
  readyForForbiddenClaimsSmokes: boolean;
} {
  const evaluation = evaluatePaidPilotGoConvergenceEra25(env);
  const paidPilotGoConvergenceEra25Milestone = resolvePaidPilotGoConvergenceEra25Milestone({
    ownerDailyBriefingBreakthroughEra25Milestone:
      evaluation.breakthrough.ownerDailyBriefingBreakthroughEra25Milestone,
    icpQualified: evaluation.goState.icpQualified,
    loiRecorded: evaluation.goState.loiRecorded,
    forbiddenClaimsPassed: evaluation.goState.forbiddenClaimsPassed,
    kickoffChecklistPresent: evaluation.kickoffChecklistPresent,
    goDecision: evaluation.goState.decision,
  });

  const readyForBreakthroughRegressionSmokes =
    evaluation.breakthrough.ownerDailyBriefingBreakthroughEra25Milestone !==
    "owner_daily_briefing_breakthrough_era25_ready";
  const readyForIcpSmokes = !evaluation.goState.icpQualified;
  const readyForLoiSmokes = !evaluation.goState.loiRecorded;
  const readyForForbiddenClaimsSmokes = !evaluation.goState.forbiddenClaimsPassed;

  return {
    evaluation,
    paidPilotGoConvergenceEra25Milestone,
    readyForBreakthroughRegressionSmokes,
    readyForIcpSmokes,
    readyForLoiSmokes,
    readyForForbiddenClaimsSmokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluatePaidPilotGoConvergenceEra25WithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: PAID_PILOT_GO_CONVERGENCE_ERA25_POLICY_ID,
          outsideLinearCatalog: true,
          paidPilotGoConvergenceEra25Milestone: result.paidPilotGoConvergenceEra25Milestone,
          ownerDailyBriefingBreakthroughEra25Milestone:
            result.evaluation.breakthrough.ownerDailyBriefingBreakthroughEra25Milestone,
          convergenceBlocked: result.evaluation.convergenceBlocked,
          goDecision: result.evaluation.goState.decision,
          icpQualified: result.evaluation.goState.icpQualified,
          loiRecorded: result.evaluation.goState.loiRecorded,
          forbiddenClaimsPassed: result.evaluation.goState.forbiddenClaimsPassed,
          kickoffChecklistPresent: result.evaluation.kickoffChecklistPresent,
          artifactPresent: result.evaluation.goState.artifactPresent,
          readyForBreakthroughRegressionSmokes: result.readyForBreakthroughRegressionSmokes,
          readyForIcpSmokes: result.readyForIcpSmokes,
          readyForLoiSmokes: result.readyForLoiSmokes,
          readyForForbiddenClaimsSmokes: result.readyForForbiddenClaimsSmokes,
          convergenceTargets: PAID_PILOT_GO_CONVERGENCE_ERA25_CONVERGENCE_TARGETS,
          humanSteps: PAID_PILOT_GO_CONVERGENCE_ERA25_HUMAN_STEPS,
          guardrails: PAID_PILOT_GO_CONVERGENCE_ERA25_GUARDRAILS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(`\nera25 paid pilot GO convergence (${PAID_PILOT_GO_CONVERGENCE_ERA25_POLICY_ID})\n`);
  console.log(`Milestone: ${result.paidPilotGoConvergenceEra25Milestone}`);
  console.log(`Convergence blocked: ${result.evaluation.convergenceBlocked ? "yes" : "no"}`);
  console.log(`GO decision: ${result.evaluation.goState.decision ?? "missing"}`);
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

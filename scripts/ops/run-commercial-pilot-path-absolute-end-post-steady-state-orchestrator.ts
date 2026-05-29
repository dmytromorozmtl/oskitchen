#!/usr/bin/env npx tsx
/**
 * Post-steady-state commercial pilot path absolute end orchestrator — sync closure report.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildCommercialPilotPathAbsoluteEndPostSteadyStateOrchestratorSummary,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_BLOCKED_MILESTONES,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_POST_STEADY_STATE_ORCHESTRATOR_ERA24_POLICY_ID,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-post-steady-state-orchestrator-era24";
import { COMMERCIAL_PILOT_PATH_ABSOLUTE_END_REPORT_PATH } from "@/lib/commercial/commercial-pilot-path-absolute-end-phases-era24";
import { evaluateCommercialPilotPathAbsoluteEnd } from "@/lib/commercial/evaluate-commercial-pilot-path-absolute-end";
import { evaluateSteadyStateOperatorLoopWithMilestones } from "@/scripts/ops/validate-steady-state-operator-loop";

export function runCommercialPilotPathAbsoluteEndPostSteadyStateOrchestrator(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildCommercialPilotPathAbsoluteEndPostSteadyStateOrchestratorSummary> {
  const evaluation = evaluateCommercialPilotPathAbsoluteEnd();
  const steadyState = evaluateSteadyStateOperatorLoopWithMilestones();

  if (options.writeArtifacts && evaluation.absoluteEndActive) {
    execSync("npm run ops:sync-commercial-pilot-path-absolute-end-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:sync-steady-state-operator-loop-report -- --write", {
      stdio: "inherit",
    });
  }

  return buildCommercialPilotPathAbsoluteEndPostSteadyStateOrchestratorSummary({
    evaluation,
    steadyStateMilestone: steadyState.steadyStateMilestone,
    engineeringPathTerminusMilestone: steadyState.pathEvaluation.engineeringPathTerminusMilestone,
    sustainedOpsConvergenceReady:
      steadyState.pathEvaluation.maintenanceMode.prerequisites.sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active:
      steadyState.pathEvaluation.maintenanceMode.prerequisites.pureOperationalModeEra25Active,
    productEvolutionReady:
      steadyState.pathEvaluation.maintenanceMode.prerequisites.productEvolutionReady,
    maintenanceModeMilestone: steadyState.pathEvaluation.maintenanceMode.maintenanceModeMilestone,
    artifacts: {
      absoluteEndReportPresent: existsSync(
        join(process.cwd(), COMMERCIAL_PILOT_PATH_ABSOLUTE_END_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runCommercialPilotPathAbsoluteEndPostSteadyStateOrchestrator({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(
      COMMERCIAL_PILOT_PATH_ABSOLUTE_END_BLOCKED_MILESTONES.includes(summary.milestone) ? 2 : 0,
    );
    return;
  }

  console.log(
    `\nCommercial pilot path absolute end post-steady-state orchestrator (${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_POST_STEADY_STATE_ORCHESTRATOR_ERA24_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`Absolute end active: ${summary.absoluteEndActive ? "yes" : "no"}`);
  console.log(`Steady state milestone: ${summary.steadyStateMilestone}`);
  console.log(`Progress: ${summary.completedSteps}/${summary.totalSteps} steps`);
  console.log(`GO decision: ${summary.goDecision ?? "missing"}`);
  if (summary.firstBlockedStepLabel) {
    console.log(
      `First blocked: Step ${summary.firstBlockedStepNumber} — ${summary.firstBlockedStepLabel}`,
    );
  }
  console.log("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    console.log(`  ${command}`);
  }
  console.log("");
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

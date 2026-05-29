#!/usr/bin/env npx tsx
/**
 * Post-engineering-terminus steady state orchestrator — sync reports, era charter checklist.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { evaluateSteadyStateOperatorLoop } from "@/lib/commercial/evaluate-steady-state-operator-loop";
import {
  buildPostTerminusSteadyStatePostEngineeringTerminusOrchestratorSummary,
  POST_TERMINUS_STEADY_STATE_POST_ENGINEERING_TERMINUS_ORCHESTRATOR_ERA24_POLICY_ID,
} from "@/lib/commercial/post-terminus-steady-state-post-engineering-terminus-orchestrator-era24";
import { POST_TERMINUS_STEADY_STATE_REPORT_PATH } from "@/lib/commercial/post-terminus-steady-state-phases-era24";
import { evaluateCommercialPilotPathWithMilestones } from "@/scripts/ops/validate-commercial-pilot-path";

export function runPostTerminusSteadyStatePostEngineeringTerminusOrchestrator(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildPostTerminusSteadyStatePostEngineeringTerminusOrchestratorSummary> {
  const evaluation = evaluateSteadyStateOperatorLoop();
  const pathEvaluation = evaluateCommercialPilotPathWithMilestones();

  if (options.writeArtifacts && evaluation.steadyStateActive) {
    execSync("npm run ops:sync-steady-state-operator-loop-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:sync-commercial-pilot-path-status-report -- --write", {
      stdio: "inherit",
    });
  }

  return buildPostTerminusSteadyStatePostEngineeringTerminusOrchestratorSummary({
    evaluation,
    engineeringPathTerminusMilestone: pathEvaluation.engineeringPathTerminusMilestone,
    artifacts: {
      steadyStateReportPresent: existsSync(
        join(process.cwd(), POST_TERMINUS_STEADY_STATE_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runPostTerminusSteadyStatePostEngineeringTerminusOrchestrator({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "engineering_terminus_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nPost-terminus steady state post-engineering-terminus orchestrator (${POST_TERMINUS_STEADY_STATE_POST_ENGINEERING_TERMINUS_ORCHESTRATOR_ERA24_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`Steady state active: ${summary.steadyStateActive ? "yes" : "no"}`);
  console.log(
    `Engineering path milestone: ${summary.engineeringPathTerminusMilestone}`,
  );
  console.log(`GO decision: ${summary.goDecision ?? "missing"}`);
  console.log(
    `Track health: ${summary.healthyCount} healthy · ${summary.overdueCount} overdue · ${summary.guidanceCount} guidance`,
  );
  if (summary.nextAttentionTrackLabel) {
    console.log(`Next attention: ${summary.nextAttentionTrackLabel}`);
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

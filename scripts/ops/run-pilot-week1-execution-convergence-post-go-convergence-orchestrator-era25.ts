#!/usr/bin/env npx tsx
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildPilotWeek1ExecutionConvergenceEra25OrchestratorSummary,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_POST_GO_CONVERGENCE_ORCHESTRATOR_POLICY_ID,
} from "@/lib/commercial/pilot-week1-execution-convergence-post-go-convergence-orchestrator-era25";
import { PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_REPORT_PATH } from "@/lib/commercial/pilot-week1-execution-convergence-phases-era25";
import { evaluatePilotWeek1ExecutionConvergenceEra25 } from "@/lib/commercial/evaluate-pilot-week1-execution-convergence-era25";

export function runPilotWeek1ExecutionConvergencePostGoConvergenceOrchestratorEra25(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildPilotWeek1ExecutionConvergenceEra25OrchestratorSummary> {
  const evaluation = evaluatePilotWeek1ExecutionConvergenceEra25();

  if (options.writeArtifacts) {
    execSync("npm run ops:sync-pilot-week1-execution-convergence-era25-report -- --write", {
      stdio: "inherit",
    });
    execSync(
      "npm run ops:sync-paid-pilot-go-convergence-era25-report -- --write",
      { stdio: "inherit" },
    );
  }

  return buildPilotWeek1ExecutionConvergenceEra25OrchestratorSummary({
    evaluation,
    artifacts: {
      convergenceReportPresent: existsSync(
        join(process.cwd(), PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runPilotWeek1ExecutionConvergencePostGoConvergenceOrchestratorEra25({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "go_convergence_regression_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nera25 pilot week 1 execution convergence post-GO orchestrator (${PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_POST_GO_CONVERGENCE_ORCHESTRATOR_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(
    `Progress: ${summary.completedPhaseCount}/${summary.totalPhaseCount} days`,
  );
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

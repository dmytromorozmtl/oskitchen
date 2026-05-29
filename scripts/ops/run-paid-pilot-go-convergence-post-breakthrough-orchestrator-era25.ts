#!/usr/bin/env npx tsx
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildPaidPilotGoConvergenceEra25OrchestratorSummary,
  PAID_PILOT_GO_CONVERGENCE_ERA25_POST_BREAKTHROUGH_ORCHESTRATOR_POLICY_ID,
} from "@/lib/commercial/paid-pilot-go-convergence-post-breakthrough-orchestrator-era25";
import { PAID_PILOT_GO_CONVERGENCE_ERA25_REPORT_PATH } from "@/lib/commercial/paid-pilot-go-convergence-phases-era25";
import { evaluatePaidPilotGoConvergenceEra25 } from "@/lib/commercial/evaluate-paid-pilot-go-convergence-era25";

export function runPaidPilotGoConvergencePostBreakthroughOrchestratorEra25(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildPaidPilotGoConvergenceEra25OrchestratorSummary> {
  const evaluation = evaluatePaidPilotGoConvergenceEra25();

  if (options.writeArtifacts) {
    execSync("npm run ops:sync-paid-pilot-go-convergence-era25-report -- --write", {
      stdio: "inherit",
    });
    execSync(
      "npm run ops:sync-owner-daily-briefing-breakthrough-era25-report -- --write",
      { stdio: "inherit" },
    );
  }

  return buildPaidPilotGoConvergenceEra25OrchestratorSummary({
    evaluation,
    artifacts: {
      convergenceReportPresent: existsSync(
        join(process.cwd(), PAID_PILOT_GO_CONVERGENCE_ERA25_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runPaidPilotGoConvergencePostBreakthroughOrchestratorEra25({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "breakthrough_regression_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nera25 paid pilot GO convergence post-breakthrough orchestrator (${PAID_PILOT_GO_CONVERGENCE_ERA25_POST_BREAKTHROUGH_ORCHESTRATOR_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`GO decision: ${summary.goDecision ?? "missing"}`);
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

#!/usr/bin/env npx tsx
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildPureOperationalModeTerminusEra25OrchestratorSummary,
  PURE_OPERATIONAL_MODE_TERMINUS_ERA25_POST_SUSTAINED_OPS_CONVERGENCE_ORCHESTRATOR_POLICY_ID,
} from "@/lib/commercial/pure-operational-mode-terminus-post-sustained-ops-convergence-orchestrator-era25";
import { PURE_OPERATIONAL_MODE_TERMINUS_ERA25_REPORT_PATH } from "@/lib/commercial/pure-operational-mode-terminus-phases-era25";
import { evaluatePureOperationalModeTerminusEra25 } from "@/lib/commercial/evaluate-pure-operational-mode-terminus-era25";

export function runPureOperationalModeTerminusPostSustainedOpsConvergenceOrchestratorEra25(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildPureOperationalModeTerminusEra25OrchestratorSummary> {
  const evaluation = evaluatePureOperationalModeTerminusEra25();

  if (options.writeArtifacts) {
    execSync("npm run ops:sync-pure-operational-mode-terminus-era25-report -- --write", {
      stdio: "inherit",
    });
    execSync(
      "npm run ops:sync-sustained-operational-excellence-convergence-era25-report -- --write",
      { stdio: "inherit" },
    );
  }

  return buildPureOperationalModeTerminusEra25OrchestratorSummary({
    evaluation,
    artifacts: {
      convergenceReportPresent: existsSync(
        join(process.cwd(), PURE_OPERATIONAL_MODE_TERMINUS_ERA25_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runPureOperationalModeTerminusPostSustainedOpsConvergenceOrchestratorEra25({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "sustained_ops_convergence_regression_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nera25 pure operational mode post-sustained-ops-convergence orchestrator (${PURE_OPERATIONAL_MODE_TERMINUS_ERA25_POST_SUSTAINED_OPS_CONVERGENCE_ORCHESTRATOR_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(
    `Track health: ${summary.healthyCount} healthy · ${summary.dueSoonCount} due soon · ${summary.overdueCount} overdue`,
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

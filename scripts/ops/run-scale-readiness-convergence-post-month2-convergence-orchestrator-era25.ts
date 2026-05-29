#!/usr/bin/env npx tsx
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildScaleReadinessConvergenceEra25OrchestratorSummary,
  SCALE_READINESS_CONVERGENCE_ERA25_POST_MONTH2_CONVERGENCE_ORCHESTRATOR_POLICY_ID,
} from "@/lib/commercial/scale-readiness-convergence-post-month2-convergence-orchestrator-era25";
import { SCALE_READINESS_CONVERGENCE_ERA25_REPORT_PATH } from "@/lib/commercial/scale-readiness-convergence-phases-era25";
import { evaluateScaleReadinessConvergenceEra25 } from "@/lib/commercial/evaluate-scale-readiness-convergence-era25";

export function runScaleReadinessConvergencePostMonth2ConvergenceOrchestratorEra25(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildScaleReadinessConvergenceEra25OrchestratorSummary> {
  const evaluation = evaluateScaleReadinessConvergenceEra25();

  if (options.writeArtifacts) {
    execSync("npm run ops:sync-scale-readiness-convergence-era25-report -- --write", {
      stdio: "inherit",
    });
    execSync(
      "npm run ops:sync-month2-market-readiness-convergence-era25-report -- --write",
      { stdio: "inherit" },
    );
  }

  return buildScaleReadinessConvergenceEra25OrchestratorSummary({
    evaluation,
    artifacts: {
      convergenceReportPresent: existsSync(
        join(process.cwd(), SCALE_READINESS_CONVERGENCE_ERA25_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runScaleReadinessConvergencePostMonth2ConvergenceOrchestratorEra25({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "month2_convergence_regression_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nera25 scale readiness post-month2-convergence orchestrator (${SCALE_READINESS_CONVERGENCE_ERA25_POST_MONTH2_CONVERGENCE_ORCHESTRATOR_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`Progress: ${summary.completedBlockingCount}/${summary.totalBlockingCount} gates`);
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

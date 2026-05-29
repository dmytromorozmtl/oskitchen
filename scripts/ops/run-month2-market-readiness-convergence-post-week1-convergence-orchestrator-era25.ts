#!/usr/bin/env npx tsx
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildMonth2MarketReadinessConvergenceEra25OrchestratorSummary,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_POST_WEEK1_CONVERGENCE_ORCHESTRATOR_POLICY_ID,
} from "@/lib/commercial/month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25";
import { MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_REPORT_PATH } from "@/lib/commercial/month2-market-readiness-convergence-phases-era25";
import { evaluateMonth2MarketReadinessConvergenceEra25 } from "@/lib/commercial/evaluate-month2-market-readiness-convergence-era25";

export function runMonth2MarketReadinessConvergencePostWeek1ConvergenceOrchestratorEra25(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildMonth2MarketReadinessConvergenceEra25OrchestratorSummary> {
  const evaluation = evaluateMonth2MarketReadinessConvergenceEra25();

  if (options.writeArtifacts) {
    execSync("npm run ops:sync-month2-market-readiness-convergence-era25-report -- --write", {
      stdio: "inherit",
    });
    execSync(
      "npm run ops:sync-pilot-week1-execution-convergence-era25-report -- --write",
      { stdio: "inherit" },
    );
  }

  return buildMonth2MarketReadinessConvergenceEra25OrchestratorSummary({
    evaluation,
    artifacts: {
      convergenceReportPresent: existsSync(
        join(process.cwd(), MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runMonth2MarketReadinessConvergencePostWeek1ConvergenceOrchestratorEra25({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "week1_convergence_regression_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nera25 month 2 market readiness post-week1-convergence orchestrator (${MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_POST_WEEK1_CONVERGENCE_ORCHESTRATOR_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(
    `Progress: ${summary.completedBlockingCount}/${summary.totalBlockingCount} workstreams`,
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

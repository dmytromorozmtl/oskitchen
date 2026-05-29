#!/usr/bin/env npx tsx
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildMarketLeaderPositioningConvergenceEra25OrchestratorSummary,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_POST_SERIES_A_CONVERGENCE_ORCHESTRATOR_POLICY_ID,
} from "@/lib/commercial/market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25";
import { MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_REPORT_PATH } from "@/lib/commercial/market-leader-positioning-convergence-phases-era25";
import { evaluateMarketLeaderPositioningConvergenceEra25 } from "@/lib/commercial/evaluate-market-leader-positioning-convergence-era25";

export function runMarketLeaderPositioningConvergencePostSeriesAConvergenceOrchestratorEra25(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildMarketLeaderPositioningConvergenceEra25OrchestratorSummary> {
  const evaluation = evaluateMarketLeaderPositioningConvergenceEra25();

  if (options.writeArtifacts) {
    execSync("npm run ops:sync-market-leader-positioning-convergence-era25-report -- --write", {
      stdio: "inherit",
    });
    execSync(
      "npm run ops:sync-series-a-partner-expansion-convergence-era25-report -- --write",
      { stdio: "inherit" },
    );
  }

  return buildMarketLeaderPositioningConvergenceEra25OrchestratorSummary({
    evaluation,
    artifacts: {
      convergenceReportPresent: existsSync(
        join(process.cwd(), MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runMarketLeaderPositioningConvergencePostSeriesAConvergenceOrchestratorEra25({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "series_a_convergence_regression_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nera25 market leader post-series-a-convergence orchestrator (${MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_POST_SERIES_A_CONVERGENCE_ORCHESTRATOR_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(
    `Progress: ${summary.completedBlockingCount}/${summary.totalBlockingCount} pillars`,
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

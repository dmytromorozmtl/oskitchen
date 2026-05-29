#!/usr/bin/env npx tsx
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildSustainedOperationalExcellenceConvergenceEra25OrchestratorSummary,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POST_MARKET_LEADER_CONVERGENCE_ORCHESTRATOR_POLICY_ID,
} from "@/lib/commercial/sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25";
import { SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_REPORT_PATH } from "@/lib/commercial/sustained-operational-excellence-convergence-phases-era25";
import { evaluateSustainedOperationalExcellenceConvergenceEra25 } from "@/lib/commercial/evaluate-sustained-operational-excellence-convergence-era25";

export function runSustainedOperationalExcellenceConvergencePostMarketLeaderConvergenceOrchestratorEra25(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildSustainedOperationalExcellenceConvergenceEra25OrchestratorSummary> {
  const evaluation = evaluateSustainedOperationalExcellenceConvergenceEra25();

  if (options.writeArtifacts) {
    execSync(
      "npm run ops:sync-sustained-operational-excellence-convergence-era25-report -- --write",
      { stdio: "inherit" },
    );
    execSync(
      "npm run ops:sync-market-leader-positioning-convergence-era25-report -- --write",
      { stdio: "inherit" },
    );
  }

  return buildSustainedOperationalExcellenceConvergenceEra25OrchestratorSummary({
    evaluation,
    artifacts: {
      convergenceReportPresent: existsSync(
        join(process.cwd(), SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary =
    runSustainedOperationalExcellenceConvergencePostMarketLeaderConvergenceOrchestratorEra25({
      writeArtifacts: write,
    });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "market_leader_convergence_regression_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nera25 sustained ops post-market-leader-convergence orchestrator (${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POST_MARKET_LEADER_CONVERGENCE_ORCHESTRATOR_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(
    `Progress: ${summary.completedBlockingCount}/${summary.totalBlockingCount} cadences`,
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

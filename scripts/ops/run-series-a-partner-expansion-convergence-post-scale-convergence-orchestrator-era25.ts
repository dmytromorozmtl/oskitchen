#!/usr/bin/env npx tsx
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildSeriesAPartnerExpansionConvergenceEra25OrchestratorSummary,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_POST_SCALE_CONVERGENCE_ORCHESTRATOR_POLICY_ID,
} from "@/lib/commercial/series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25";
import { SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_REPORT_PATH } from "@/lib/commercial/series-a-partner-expansion-convergence-phases-era25";
import { evaluateSeriesAPartnerExpansionConvergenceEra25 } from "@/lib/commercial/evaluate-series-a-partner-expansion-convergence-era25";

export function runSeriesAPartnerExpansionConvergencePostScaleConvergenceOrchestratorEra25(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildSeriesAPartnerExpansionConvergenceEra25OrchestratorSummary> {
  const evaluation = evaluateSeriesAPartnerExpansionConvergenceEra25();

  if (options.writeArtifacts) {
    execSync("npm run ops:sync-series-a-partner-expansion-convergence-era25-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:sync-scale-readiness-convergence-era25-report -- --write", {
      stdio: "inherit",
    });
  }

  return buildSeriesAPartnerExpansionConvergenceEra25OrchestratorSummary({
    evaluation,
    artifacts: {
      convergenceReportPresent: existsSync(
        join(process.cwd(), SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runSeriesAPartnerExpansionConvergencePostScaleConvergenceOrchestratorEra25({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "scale_convergence_regression_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nera25 series a post-scale-convergence orchestrator (${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_POST_SCALE_CONVERGENCE_ORCHESTRATOR_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`Progress: ${summary.completedBlockingCount}/${summary.totalBlockingCount} tracks`);
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

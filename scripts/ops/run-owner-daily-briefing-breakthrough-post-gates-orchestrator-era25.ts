#!/usr/bin/env npx tsx
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildOwnerDailyBriefingBreakthroughEra25OrchestratorSummary,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_POST_GATES_ORCHESTRATOR_POLICY_ID,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-post-gates-orchestrator-era25";
import { OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_REPORT_PATH } from "@/lib/commercial/owner-daily-briefing-breakthrough-phases-era25";
import { evaluateOwnerDailyBriefingBreakthroughEra25 } from "@/lib/commercial/evaluate-owner-daily-briefing-breakthrough-era25";

export function runOwnerDailyBriefingBreakthroughPostGatesOrchestratorEra25(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildOwnerDailyBriefingBreakthroughEra25OrchestratorSummary> {
  const evaluation = evaluateOwnerDailyBriefingBreakthroughEra25();

  if (options.writeArtifacts) {
    execSync("npm run ops:sync-owner-daily-briefing-breakthrough-era25-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:sync-era25-first-product-slice-blueprint-report -- --write", {
      stdio: "inherit",
    });
  }

  return buildOwnerDailyBriefingBreakthroughEra25OrchestratorSummary({
    evaluation,
    artifacts: {
      productReportPresent: existsSync(
        join(process.cwd(), OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runOwnerDailyBriefingBreakthroughPostGatesOrchestratorEra25({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "blueprint_regression_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nera25 owner daily briefing breakthrough post-gates orchestrator (${OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_POST_GATES_ORCHESTRATOR_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`Slice blocked: ${summary.sliceBlocked ? "yes" : "no"}`);
  console.log(
    `Briefing tiles: ${summary.wiredBriefingTileCount}/${summary.briefingSchemeCount}`,
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

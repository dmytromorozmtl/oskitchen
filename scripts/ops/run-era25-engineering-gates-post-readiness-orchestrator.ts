#!/usr/bin/env npx tsx
/**
 * Post-readiness era25 engineering gates orchestrator — sync gates report.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildEra25EngineeringGatesPostReadinessOrchestratorSummary,
  ERA25_ENGINEERING_GATES_POST_READINESS_ORCHESTRATOR_ERA24_POLICY_ID,
} from "@/lib/commercial/era25-engineering-gates-post-readiness-orchestrator-era24";
import { ERA25_ENGINEERING_GATES_REPORT_PATH } from "@/lib/commercial/era25-engineering-gates-require-signed-charter-phases-era24";
import { evaluateEra25EngineeringGatesRequireSignedCharter } from "@/lib/commercial/evaluate-era25-engineering-gates-require-signed-charter";

export function runEra25EngineeringGatesPostReadinessOrchestrator(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildEra25EngineeringGatesPostReadinessOrchestratorSummary> {
  const evaluation = evaluateEra25EngineeringGatesRequireSignedCharter();

  if (options.writeArtifacts) {
    execSync("npm run ops:sync-era25-engineering-gates-require-signed-charter-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:sync-era25-first-charter-slice-readiness-report -- --write", {
      stdio: "inherit",
    });
  }

  return buildEra25EngineeringGatesPostReadinessOrchestratorSummary({
    evaluation,
    artifacts: {
      gatesReportPresent: existsSync(join(process.cwd(), ERA25_ENGINEERING_GATES_REPORT_PATH)),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runEra25EngineeringGatesPostReadinessOrchestrator({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "charter_readiness_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nera25 engineering gates post-readiness orchestrator (${ERA25_ENGINEERING_GATES_POST_READINESS_ORCHESTRATOR_ERA24_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`Gates blocked: ${summary.gatesBlocked ? "yes" : "no"}`);
  console.log(`Readiness milestone: ${summary.era25FirstCharterSliceReadinessMilestone}`);
  console.log(`Illegal artifacts: ${summary.illegalArtifactCount}`);
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

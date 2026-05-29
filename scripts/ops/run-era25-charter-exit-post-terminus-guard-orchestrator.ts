#!/usr/bin/env npx tsx
/**
 * Post-terminus-guard era25 charter exit orchestrator — sync process report.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildEra25CharterExitPostTerminusGuardOrchestratorSummary,
  ERA25_CHARTER_EXIT_POST_TERMINUS_GUARD_ORCHESTRATOR_ERA24_POLICY_ID,
} from "@/lib/commercial/era25-charter-exit-post-terminus-guard-orchestrator-era24";
import { ERA25_CHARTER_EXIT_REPORT_PATH } from "@/lib/commercial/era25-charter-exit-outside-linear-path-phases-era24";
import { evaluateEra25CharterExitOutsideLinearPath } from "@/lib/commercial/evaluate-era25-charter-exit-outside-linear-path";

export function runEra25CharterExitPostTerminusGuardOrchestrator(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildEra25CharterExitPostTerminusGuardOrchestratorSummary> {
  const evaluation = evaluateEra25CharterExitOutsideLinearPath();

  if (options.writeArtifacts) {
    execSync("npm run ops:sync-era25-charter-exit-outside-linear-path-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:export-era-charter-readiness-checklist -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:sync-linear-chain-terminus-guard-report -- --write", {
      stdio: "inherit",
    });
  }

  return buildEra25CharterExitPostTerminusGuardOrchestratorSummary({
    evaluation,
    artifacts: {
      era25CharterExitReportPresent: existsSync(
        join(process.cwd(), ERA25_CHARTER_EXIT_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runEra25CharterExitPostTerminusGuardOrchestrator({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "terminus_guard_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nera25 charter exit post-terminus-guard orchestrator (${ERA25_CHARTER_EXIT_POST_TERMINUS_GUARD_ORCHESTRATOR_ERA24_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`Guard passed: ${summary.guardPassed ? "yes" : "no"}`);
  console.log(`Charter checklist present: ${summary.charterChecklistPresent ? "yes" : "no"}`);
  console.log(`Signed charter present: ${summary.signedCharterPresent ? "yes" : "no"}`);
  console.log(`era25 charter docs: ${summary.era25CharterDocCount}`);
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

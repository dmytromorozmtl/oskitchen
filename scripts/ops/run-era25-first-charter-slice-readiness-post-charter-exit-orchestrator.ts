#!/usr/bin/env npx tsx
/**
 * Post-charter-exit era25 first charter slice readiness orchestrator — sync readiness report.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildEra25FirstCharterSliceReadinessPostCharterExitOrchestratorSummary,
  ERA25_FIRST_CHARTER_SLICE_READINESS_POST_CHARTER_EXIT_ORCHESTRATOR_ERA24_POLICY_ID,
} from "@/lib/commercial/era25-first-charter-slice-readiness-post-charter-exit-orchestrator-era24";
import { ERA25_FIRST_CHARTER_SLICE_READINESS_REPORT_PATH } from "@/lib/commercial/era25-first-charter-slice-readiness-phases-era24";
import { evaluateEra25FirstCharterSliceReadiness } from "@/lib/commercial/evaluate-era25-first-charter-slice-readiness";
import { evaluateEra25CharterExitOutsideLinearPathWithMilestones } from "@/scripts/ops/validate-era25-charter-exit-outside-linear-path";

export function runEra25FirstCharterSliceReadinessPostCharterExitOrchestrator(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildEra25FirstCharterSliceReadinessPostCharterExitOrchestratorSummary> {
  const evaluation = evaluateEra25FirstCharterSliceReadiness();
  const charterExit = evaluateEra25CharterExitOutsideLinearPathWithMilestones();

  if (options.writeArtifacts) {
    execSync("npm run ops:sync-era25-first-charter-slice-readiness-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:sync-era25-charter-exit-outside-linear-path-report -- --write", {
      stdio: "inherit",
    });
  }

  return buildEra25FirstCharterSliceReadinessPostCharterExitOrchestratorSummary({
    evaluation,
    era25CharterExitMilestone: charterExit.era25CharterExitMilestone,
    artifacts: {
      readinessReportPresent: existsSync(
        join(process.cwd(), ERA25_FIRST_CHARTER_SLICE_READINESS_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runEra25FirstCharterSliceReadinessPostCharterExitOrchestrator({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "charter_exit_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nera25 first charter slice readiness post-charter-exit orchestrator (${ERA25_FIRST_CHARTER_SLICE_READINESS_POST_CHARTER_EXIT_ORCHESTRATOR_ERA24_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`Charter exit milestone: ${summary.era25CharterExitMilestone}`);
  console.log(`Charter doc: ${summary.charterDocPath ?? "none"}`);
  console.log(`Sections valid: ${summary.sectionsValid ? "yes" : "no"}`);
  console.log(`Missing sections: ${summary.missingSectionCount}`);
  if (summary.firstMissingSectionLabel) {
    console.log(`First missing: ${summary.firstMissingSectionLabel}`);
  }
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

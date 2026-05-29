#!/usr/bin/env npx tsx
/**
 * Post-maintenance-mode Engineering path terminus orchestrator — sync status report.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { evaluateCommercialPilotPath } from "@/lib/commercial/evaluate-commercial-pilot-path";
import {
  buildEngineeringPathTerminusPostMaintenanceModeOrchestratorSummary,
  ENGINEERING_PATH_TERMINUS_BLOCKED_MILESTONES,
  ENGINEERING_PATH_TERMINUS_POST_MAINTENANCE_MODE_ORCHESTRATOR_ERA24_POLICY_ID,
} from "@/lib/commercial/engineering-path-terminus-post-maintenance-mode-orchestrator-era24";
import { COMMERCIAL_PILOT_PATH_STATUS_REPORT_PATH } from "@/lib/commercial/engineering-path-terminus-era24";
import { evaluateMaintenanceMode } from "@/scripts/ops/validate-maintenance-mode";

export function runEngineeringPathTerminusPostMaintenanceModeOrchestrator(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildEngineeringPathTerminusPostMaintenanceModeOrchestratorSummary> {
  const evaluation = evaluateCommercialPilotPath();
  const maintenanceMode = evaluateMaintenanceMode();

  if (options.writeArtifacts && maintenanceMode.maintenanceModeActive) {
    execSync("npm run ops:sync-commercial-pilot-path-status-report -- --write", {
      stdio: "inherit",
    });
  }

  return buildEngineeringPathTerminusPostMaintenanceModeOrchestratorSummary({
    evaluation,
    maintenanceMode,
    artifacts: {
      statusReportPresent: existsSync(
        join(process.cwd(), COMMERCIAL_PILOT_PATH_STATUS_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runEngineeringPathTerminusPostMaintenanceModeOrchestrator({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(
      ENGINEERING_PATH_TERMINUS_BLOCKED_MILESTONES.includes(summary.milestone) ? 2 : 0,
    );
    return;
  }

  console.log(
    `\nEngineering path terminus post-maintenance-mode orchestrator (${ENGINEERING_PATH_TERMINUS_POST_MAINTENANCE_MODE_ORCHESTRATOR_ERA24_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(
    `Progress: ${summary.completedSteps}/${summary.totalSteps} steps · gate chain ${summary.gateStepsComplete ? "complete" : "blocked"}`,
  );
  console.log(`Engineering terminus active: ${summary.engineeringTerminusActive ? "yes" : "no"}`);
  console.log(`Maintenance mode active: ${summary.maintenanceModeActive ? "yes" : "no"}`);
  console.log(`GO decision: ${summary.goDecision ?? "missing"}`);
  if (summary.firstBlockedStepLabel) {
    console.log(`First blocked: Step ${summary.firstBlockedStepNumber} — ${summary.firstBlockedStepLabel}`);
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

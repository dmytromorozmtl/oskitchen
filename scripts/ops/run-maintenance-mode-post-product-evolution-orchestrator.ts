#!/usr/bin/env npx tsx
/**
 * Post-product-evolution Maintenance mode orchestrator — sync playbook, export rhythm calendar.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildMaintenanceModePostProductEvolutionOrchestratorSummary,
  MAINTENANCE_MODE_POST_PRODUCT_EVOLUTION_ORCHESTRATOR_ERA24_POLICY_ID,
} from "@/lib/commercial/maintenance-mode-post-product-evolution-orchestrator-era24";
import {
  MAINTENANCE_MODE_PLAYBOOK_REPORT_PATH,
  MAINTENANCE_MODE_RHYTHM_CALENDAR_DOC,
} from "@/lib/commercial/maintenance-mode-phases-era24";
import { evaluateMaintenanceMode } from "@/scripts/ops/validate-maintenance-mode";

export function runMaintenanceModePostProductEvolutionOrchestrator(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildMaintenanceModePostProductEvolutionOrchestratorSummary> {
  const evaluation = evaluateMaintenanceMode();

  if (options.writeArtifacts && evaluation.maintenanceModeActive) {
    execSync("npm run ops:sync-maintenance-mode-playbook-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:export-maintenance-mode-rhythm-calendar -- --write", {
      stdio: "inherit",
    });
  }

  return buildMaintenanceModePostProductEvolutionOrchestratorSummary({
    evaluation,
    artifacts: {
      playbookReportPresent: existsSync(
        join(process.cwd(), MAINTENANCE_MODE_PLAYBOOK_REPORT_PATH),
      ),
      rhythmCalendarDocPresent: existsSync(join(process.cwd(), MAINTENANCE_MODE_RHYTHM_CALENDAR_DOC)),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runMaintenanceModePostProductEvolutionOrchestrator({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(
      summary.milestone === "product_evolution_blocked" ||
        summary.milestone === "era25_sustained_ops_convergence_blocked"
        ? 2
        : 0,
    );
    return;
  }

  console.log(
    `\nMaintenance mode post-product-evolution orchestrator (${MAINTENANCE_MODE_POST_PRODUCT_EVOLUTION_ORCHESTRATOR_ERA24_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`Maintenance mode active: ${summary.maintenanceModeActive ? "yes" : "no"}`);
  console.log(
    `Commercial pilot path complete: ${summary.commercialPilotPathComplete ? "yes" : "no"}`,
  );
  console.log(`Product evolution ready: ${summary.productEvolutionReady ? "yes" : "no"}`);
  console.log(`GO decision: ${summary.goDecision ?? "missing"}`);
  console.log(
    `Rhythm health: ${summary.healthyCount} healthy · ${summary.dueSoonCount} due soon · ${summary.overdueCount} overdue · ${summary.guidanceCount} guidance`,
  );
  if (summary.nextAttentionRhythmLabel) {
    console.log(`Next attention: ${summary.nextAttentionRhythmLabel}`);
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

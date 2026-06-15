#!/usr/bin/env npx tsx
/**
 * Records Maintenance mode integrity baseline when Product evolution honest + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateMaintenanceModeIntegrity } from "@/lib/commercial/maintenance-mode-integrity-era36";
import {
  MAINTENANCE_MODE_INTEGRITY_BASELINE_ARTIFACT,
  type MaintenanceModeIntegrityBaseline,
} from "@/lib/commercial/maintenance-mode-integrity-era36";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateMaintenanceModeIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — Maintenance mode integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.maintenanceModeComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error("Cannot record baseline — honest Product evolution + GO prerequisite not met.");
    process.exit(2);
  }

  const baseline: MaintenanceModeIntegrityBaseline = {
    maintenanceModeExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    productEvolutionCompleteAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), MAINTENANCE_MODE_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${MAINTENANCE_MODE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

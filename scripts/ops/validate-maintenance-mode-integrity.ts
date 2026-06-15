#!/usr/bin/env npx tsx
/**
 * Validates Maintenance mode integrity — never start without honest Product evolution.
 */
import {
  evaluateMaintenanceModeIntegrity,
  MAINTENANCE_MODE_INTEGRITY_ERA36_POLICY_ID,
} from "@/lib/commercial/maintenance-mode-integrity-era36";

export { evaluateMaintenanceModeIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateMaintenanceModeIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(`\nMaintenance mode integrity (${MAINTENANCE_MODE_INTEGRITY_ERA36_POLICY_ID})\n`);
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(`Maintenance mode started: ${result.maintenanceModeExecutionStarted ? "yes" : "no"}`);
  console.log(`Product evolution honest: ${result.maintenanceModeComplete ? "yes" : "no"}`);
  console.log(`GO: ${result.goDecision ?? "missing"} · GO integrity: ${result.goIntegrityPassed}`);

  for (const violation of result.violations) {
    console.log(`  [${violation.id}] ${violation.detail}`);
  }

  console.log("\nRecommended:");
  for (const command of result.recommendedCommands) {
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

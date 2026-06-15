#!/usr/bin/env npx tsx
/**
 * Validates Engineering path terminus integrity — never start without honest Maintenance mode.
 */
import {
  evaluateEngineeringPathTerminusIntegrity,
  ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_POLICY_ID,
} from "@/lib/commercial/engineering-path-terminus-integrity-era37";

export { evaluateEngineeringPathTerminusIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEngineeringPathTerminusIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEngineering path terminus integrity (${ENGINEERING_PATH_TERMINUS_INTEGRITY_ERA37_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Engineering path terminus started: ${result.engineeringPathTerminusExecutionStarted ? "yes" : "no"}`,
  );
  console.log(`Maintenance mode honest: ${result.engineeringPathTerminusComplete ? "yes" : "no"}`);
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

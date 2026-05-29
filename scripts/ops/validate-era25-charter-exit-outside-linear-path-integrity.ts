#!/usr/bin/env npx tsx
/**
 * Validates era25 charter exit outside linear path integrity — never start without honest Step 17 guard.
 */
import {
  evaluateEra25CharterExitOutsideLinearPathIntegrity,
  ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_POLICY_ID,
} from "@/lib/commercial/era25-charter-exit-outside-linear-path-integrity-era42";

export { evaluateEra25CharterExitOutsideLinearPathIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25CharterExitOutsideLinearPathIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 charter exit outside linear path integrity (${ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_INTEGRITY_ERA42_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(`Charter exit started: ${result.era25CharterExitExecutionStarted ? "yes" : "no"}`);
  console.log(`Step 17 guard honest: ${result.era25CharterExitComplete ? "yes" : "no"}`);
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

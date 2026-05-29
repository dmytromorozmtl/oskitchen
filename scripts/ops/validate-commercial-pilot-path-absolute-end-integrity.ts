#!/usr/bin/env npx tsx
/**
 * Validates Commercial pilot path absolute end integrity — never start without honest Post-terminus steady state.
 */
import {
  evaluateCommercialPilotPathAbsoluteEndIntegrity,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_POLICY_ID,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-integrity-era39";

export { evaluateCommercialPilotPathAbsoluteEndIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateCommercialPilotPathAbsoluteEndIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nCommercial pilot path absolute end integrity (${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_INTEGRITY_ERA39_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Absolute end started: ${result.commercialPilotPathAbsoluteEndExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Post-terminus steady state honest: ${result.commercialPilotPathAbsoluteEndComplete ? "yes" : "no"}`,
  );
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

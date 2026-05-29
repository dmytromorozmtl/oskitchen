#!/usr/bin/env npx tsx
/**
 * Validates Scale readiness integrity — never start Scale without honest Month 2.
 */
import {
  evaluateScaleReadinessIntegrity,
  SCALE_READINESS_INTEGRITY_ERA30_POLICY_ID,
} from "@/lib/commercial/scale-readiness-integrity-era30";

export { evaluateScaleReadinessIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateScaleReadinessIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(`\nScale readiness integrity (${SCALE_READINESS_INTEGRITY_ERA30_POLICY_ID})\n`);
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(`Scale started: ${result.scaleExecutionStarted ? "yes" : "no"}`);
  console.log(`Month 2 honest: ${result.month2Complete ? "yes" : "no"}`);
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

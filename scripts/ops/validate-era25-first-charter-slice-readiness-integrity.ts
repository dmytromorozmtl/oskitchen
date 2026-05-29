#!/usr/bin/env npx tsx
/**
 * Validates era25 first charter slice readiness integrity — never start without honest charter exit.
 */
import {
  evaluateEra25FirstCharterSliceReadinessIntegrity,
  ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_ERA43_POLICY_ID,
} from "@/lib/commercial/era25-first-charter-slice-readiness-integrity-era43";

export { evaluateEra25FirstCharterSliceReadinessIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25FirstCharterSliceReadinessIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 first charter slice readiness integrity (${ERA25_FIRST_CHARTER_SLICE_READINESS_INTEGRITY_ERA43_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(`First slice started: ${result.era25FirstCharterSliceExecutionStarted ? "yes" : "no"}`);
  console.log(`Charter exit honest: ${result.era25FirstCharterSliceComplete ? "yes" : "no"}`);
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

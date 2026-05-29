#!/usr/bin/env npx tsx
/**
 * Validates era25 first product slice blueprint integrity — never attest without honest engineering gates.
 */
import {
  evaluateEra25FirstProductSliceBlueprintIntegrity,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_ERA45_POLICY_ID,
} from "@/lib/commercial/era25-first-product-slice-blueprint-integrity-era45";

export { evaluateEra25FirstProductSliceBlueprintIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25FirstProductSliceBlueprintIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 first product slice blueprint integrity (${ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_INTEGRITY_ERA45_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Blueprint started: ${result.era25FirstProductSliceBlueprintExecutionStarted ? "yes" : "no"}`,
  );
  console.log(`Gates open honest: ${result.era25FirstProductSliceBlueprintComplete ? "yes" : "no"}`);
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

#!/usr/bin/env npx tsx
/**
 * Validates Sustained product evolution integrity — never start without honest Improvement loop.
 */
import {
  evaluateSustainedProductEvolutionIntegrity,
  SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_POLICY_ID,
} from "@/lib/commercial/sustained-product-evolution-integrity-era35";

export { evaluateSustainedProductEvolutionIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateSustainedProductEvolutionIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nSustained product evolution integrity (${SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(`Product evolution started: ${result.productEvolutionExecutionStarted ? "yes" : "no"}`);
  console.log(`Improvement loop honest: ${result.productEvolutionComplete ? "yes" : "no"}`);
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

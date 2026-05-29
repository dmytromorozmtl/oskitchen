#!/usr/bin/env npx tsx
/**
 * Validates sustained product evolution re-entrant integrity — post-train-closure improvement-loop path.
 */
import {
  evaluateSustainedProductEvolutionReentrantIntegrity,
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_POLICY_ID,
} from "@/lib/commercial/sustained-product-evolution-re-entrant-integrity-era56";

export { evaluateSustainedProductEvolutionReentrantIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateSustainedProductEvolutionReentrantIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nSustained product evolution re-entrant integrity (${SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Re-entrant started: ${result.sustainedProductEvolutionReentrantExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Re-entrant complete: ${result.sustainedProductEvolutionReentrantComplete ? "yes" : "no"}`,
  );
  console.log(
    `Train closure complete: ${result.era25CommercialPilotConvergenceTrainClosureComplete ? "yes" : "no"}`,
  );
  console.log(`Improvement loop active: ${result.improvementLoopActive ? "yes" : "no"}`);
  console.log(
    `Linear convergence reopened: ${result.linearConvergenceSurfaceReopened ? "yes" : "no"}`,
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

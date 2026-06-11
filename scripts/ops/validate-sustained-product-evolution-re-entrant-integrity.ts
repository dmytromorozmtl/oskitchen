#!/usr/bin/env npx tsx
/**
 * Validates sustained product evolution re-entrant integrity — post-train-closure improvement-loop path.
 */
import {
import { logger } from "@/lib/logger";
  evaluateSustainedProductEvolutionReentrantIntegrity,
  SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_POLICY_ID,
} from "@/lib/commercial/sustained-product-evolution-re-entrant-integrity-era56";

export { evaluateSustainedProductEvolutionReentrantIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateSustainedProductEvolutionReentrantIntegrity();

  if (jsonOutput) {
    logger.cli(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  logger.cli(
    `\nSustained product evolution re-entrant integrity (${SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_INTEGRITY_ERA56_POLICY_ID})\n`,
  );
  logger.cli(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  logger.cli(
    `Re-entrant started: ${result.sustainedProductEvolutionReentrantExecutionStarted ? "yes" : "no"}`,
  );
  logger.cli(
    `Re-entrant complete: ${result.sustainedProductEvolutionReentrantComplete ? "yes" : "no"}`,
  );
  logger.cli(
    `Train closure complete: ${result.era25CommercialPilotConvergenceTrainClosureComplete ? "yes" : "no"}`,
  );
  logger.cli(`Improvement loop active: ${result.improvementLoopActive ? "yes" : "no"}`);
  logger.cli(
    `Linear convergence reopened: ${result.linearConvergenceSurfaceReopened ? "yes" : "no"}`,
  );
  logger.cli(`GO: ${result.goDecision ?? "missing"} · GO integrity: ${result.goIntegrityPassed}`);

  for (const violation of result.violations) {
    logger.cli(`  [${violation.id}] ${violation.detail}`);
  }

  logger.cli("\nRecommended:");
  for (const command of result.recommendedCommands) {
    logger.cli(`  ${command}`);
  }
  logger.cli("");
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

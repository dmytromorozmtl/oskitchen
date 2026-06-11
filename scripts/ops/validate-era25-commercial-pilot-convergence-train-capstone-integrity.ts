#!/usr/bin/env npx tsx
/**
 * Validates era25 commercial pilot convergence train capstone integrity.
 */
import {
import { logger } from "@/lib/logger";
  evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_ERA59_POLICY_ID,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-capstone-integrity-era59";

export { evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity();

  if (jsonOutput) {
    logger.cli(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  logger.cli(
    `\nEra25 commercial pilot convergence train capstone integrity (${ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_ERA59_POLICY_ID})\n`,
  );
  logger.cli(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  logger.cli(
    `Capstone started: ${result.era25CommercialPilotConvergenceTrainCapstoneExecutionStarted ? "yes" : "no"}`,
  );
  logger.cli(
    `Capstone complete: ${result.era25CommercialPilotConvergenceTrainCapstoneComplete ? "yes" : "no"}`,
  );
  logger.cli(
    `Steady-state lock complete: ${result.era25SteadyStateOperatorLoopLockComplete ? "yes" : "no"}`,
  );
  logger.cli(`P0 proof status: ${result.p0ProofStatus ?? "missing"}`);
  logger.cli(`P0 artifact present: ${result.p0ArtifactPresent ? "yes" : "no"}`);
  logger.cli(`Frozen env mutation: ${result.frozenEnvMutationDetected ? "yes" : "no"}`);
  logger.cli(`GO: ${result.goDecision ?? "missing"}`);

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

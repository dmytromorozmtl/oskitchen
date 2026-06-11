#!/usr/bin/env npx tsx
/**
 * Validates era25 convergence governance terminus freeze integrity.
 */
import {
import { logger } from "@/lib/logger";
  evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity,
  ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_POLICY_ID,
} from "@/lib/commercial/era25-convergence-governance-terminus-freeze-integrity-era60";

export { evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity();

  if (jsonOutput) {
    logger.cli(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  logger.cli(
    `\nEra25 convergence governance terminus freeze integrity (${ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_POLICY_ID})\n`,
  );
  logger.cli(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  logger.cli(
    `Terminus freeze started: ${result.era25ConvergenceGovernanceTerminusFreezeExecutionStarted ? "yes" : "no"}`,
  );
  logger.cli(
    `Terminus freeze complete: ${result.era25ConvergenceGovernanceTerminusFreezeComplete ? "yes" : "no"}`,
  );
  logger.cli(
    `Train capstone complete: ${result.era25CommercialPilotConvergenceTrainCapstoneComplete ? "yes" : "no"}`,
  );
  logger.cli(
    `Convergence UI suppressed: ${result.era25ProductConvergenceSurfacesSuppressed ? "yes" : "no"}`,
  );
  logger.cli(`P0 proof status: ${result.p0ProofStatus ?? "missing"}`);
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

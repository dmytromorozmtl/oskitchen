#!/usr/bin/env npx tsx
/**
 * Validates era25 steady-state operator loop convergence lock integrity.
 */
import {
import { logger } from "@/lib/logger";
  evaluateEra25SteadyStateOperatorLoopLockIntegrity,
  ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_ERA58_POLICY_ID,
} from "@/lib/commercial/era25-steady-state-operator-loop-lock-integrity-era58";

export { evaluateEra25SteadyStateOperatorLoopLockIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25SteadyStateOperatorLoopLockIntegrity();

  if (jsonOutput) {
    logger.cli(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  logger.cli(
    `\nEra25 steady-state operator loop lock integrity (${ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_INTEGRITY_ERA58_POLICY_ID})\n`,
  );
  logger.cli(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  logger.cli(
    `Steady-state lock started: ${result.era25SteadyStateOperatorLoopLockExecutionStarted ? "yes" : "no"}`,
  );
  logger.cli(
    `Steady-state lock complete: ${result.era25SteadyStateOperatorLoopLockComplete ? "yes" : "no"}`,
  );
  logger.cli(
    `Charter lock complete: ${result.era25PostReentrantCharterLockComplete ? "yes" : "no"}`,
  );
  logger.cli(`Improvement loop active: ${result.improvementLoopActive ? "yes" : "no"}`);
  logger.cli(
    `Frozen env mutation: ${result.frozenEnvMutationDetected ? "yes" : "no"}`,
  );
  logger.cli(
    `Loop rhythm mutation: ${result.improvementLoopRhythmMutationDetected ? "yes" : "no"}`,
  );
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

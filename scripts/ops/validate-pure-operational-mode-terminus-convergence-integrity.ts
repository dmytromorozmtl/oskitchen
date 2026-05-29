#!/usr/bin/env npx tsx
/**
 * Validates pure operational mode terminus convergence era25 integrity — never attest without honest sustained ops.
 */
import {
  evaluatePureOperationalModeTerminusConvergenceIntegrity,
  PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_POLICY_ID,
} from "@/lib/commercial/pure-operational-mode-terminus-convergence-integrity-era54";

export { evaluatePureOperationalModeTerminusConvergenceIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluatePureOperationalModeTerminusConvergenceIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nPure operational mode terminus convergence integrity (${PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_ERA54_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Pure ops terminus convergence started: ${result.pureOperationalModeTerminusConvergenceExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Pure ops terminus convergence complete: ${result.pureOperationalModeTerminusConvergenceComplete ? "yes" : "no"}`,
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

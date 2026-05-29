#!/usr/bin/env npx tsx
/**
 * Validates paid pilot GO convergence era25 integrity — never attest without honest breakthrough.
 */
import {
  evaluatePaidPilotGoConvergenceIntegrity,
  PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_POLICY_ID,
} from "@/lib/commercial/paid-pilot-go-convergence-integrity-era47";

export { evaluatePaidPilotGoConvergenceIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluatePaidPilotGoConvergenceIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nPaid pilot GO convergence integrity (${PAID_PILOT_GO_CONVERGENCE_INTEGRITY_ERA47_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `GO convergence started: ${result.paidPilotGoConvergenceExecutionStarted ? "yes" : "no"}`,
  );
  console.log(`Breakthrough ready honest: ${result.paidPilotGoConvergenceComplete ? "yes" : "no"}`);
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

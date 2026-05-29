#!/usr/bin/env npx tsx
/**
 * Validates era25 commercial pilot convergence train capstone integrity.
 */
import {
  evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_ERA59_POLICY_ID,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-capstone-integrity-era59";

export { evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 commercial pilot convergence train capstone integrity (${ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_ERA59_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Capstone started: ${result.era25CommercialPilotConvergenceTrainCapstoneExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Capstone complete: ${result.era25CommercialPilotConvergenceTrainCapstoneComplete ? "yes" : "no"}`,
  );
  console.log(
    `Steady-state lock complete: ${result.era25SteadyStateOperatorLoopLockComplete ? "yes" : "no"}`,
  );
  console.log(`P0 proof status: ${result.p0ProofStatus ?? "missing"}`);
  console.log(`P0 artifact present: ${result.p0ArtifactPresent ? "yes" : "no"}`);
  console.log(`Frozen env mutation: ${result.frozenEnvMutationDetected ? "yes" : "no"}`);
  console.log(`GO: ${result.goDecision ?? "missing"}`);

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

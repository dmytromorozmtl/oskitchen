#!/usr/bin/env npx tsx
/**
 * Validates era25 convergence governance terminus freeze integrity.
 */
import {
  evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity,
  ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_POLICY_ID,
} from "@/lib/commercial/era25-convergence-governance-terminus-freeze-integrity-era60";

export { evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 convergence governance terminus freeze integrity (${ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_ERA60_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Terminus freeze started: ${result.era25ConvergenceGovernanceTerminusFreezeExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Terminus freeze complete: ${result.era25ConvergenceGovernanceTerminusFreezeComplete ? "yes" : "no"}`,
  );
  console.log(
    `Train capstone complete: ${result.era25CommercialPilotConvergenceTrainCapstoneComplete ? "yes" : "no"}`,
  );
  console.log(
    `Convergence UI suppressed: ${result.era25ProductConvergenceSurfacesSuppressed ? "yes" : "no"}`,
  );
  console.log(`P0 proof status: ${result.p0ProofStatus ?? "missing"}`);
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

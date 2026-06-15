#!/usr/bin/env npx tsx
/**
 * Validates era25 governance train terminal seal integrity.
 */
import {
  evaluateEra25GovernanceTrainTerminalSealIntegrity,
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_POLICY_ID,
} from "@/lib/commercial/era25-governance-train-terminal-seal-integrity-era64";

export { evaluateEra25GovernanceTrainTerminalSealIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25GovernanceTrainTerminalSealIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 governance train terminal seal integrity (${ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_ERA64_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Seal started: ${result.era25GovernanceTrainTerminalSealExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Seal complete: ${result.era25GovernanceTrainTerminalSealComplete ? "yes" : "no"}`,
  );
  console.log(
    `Governance chain closed: ${result.era25MarketProofGovernanceChainClosed ? "yes" : "no"}`,
  );
  console.log(
    `Steady ops witness active: ${result.postMarketProofSteadyOpsWitnessActive ? "yes" : "no"}`,
  );
  console.log(`Train sealed: ${result.era25GovernanceTrainSealed ? "yes" : "no"}`);

  if (result.violations.length > 0) {
    console.log("\nViolations:");
    for (const violation of result.violations) {
      console.log(`  [${violation.id}] ${violation.detail}`);
    }
  }

  process.exit(result.integrityPassed ? 0 : 2);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

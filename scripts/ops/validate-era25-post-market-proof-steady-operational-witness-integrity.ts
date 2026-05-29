#!/usr/bin/env npx tsx
/**
 * Validates era25 post-market-proof steady operational witness integrity.
 */
import {
  evaluateEra25PostMarketProofSteadyOperationalWitnessIntegrity,
  ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_ERA63_POLICY_ID,
} from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-integrity-era63";

export { evaluateEra25PostMarketProofSteadyOperationalWitnessIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25PostMarketProofSteadyOperationalWitnessIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 post-market-proof steady operational witness integrity (${ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_ERA63_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Witness started: ${result.era25PostMarketProofSteadyOperationalWitnessExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Witness complete: ${result.era25PostMarketProofSteadyOperationalWitnessComplete ? "yes" : "no"}`,
  );
  console.log(
    `Governance chain closed: ${result.era25MarketProofGovernanceChainClosed ? "yes" : "no"}`,
  );
  console.log(
    `Improvement loop integrity: ${result.continuousImprovementLoopIntegrityPassed ? "PASS" : "FAIL"}`,
  );
  console.log(`P0 proof status: ${result.p0ProofStatus ?? "n/a"}`);

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

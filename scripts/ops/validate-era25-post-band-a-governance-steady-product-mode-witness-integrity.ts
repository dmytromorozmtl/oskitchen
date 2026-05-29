#!/usr/bin/env npx tsx
/**
 * Validates era25 post-band-a-governance steady product mode witness integrity.
 */
import {
  evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity,
  ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_ERA67_POLICY_ID,
} from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-integrity-era67";

export { evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 post-band-a-governance steady product mode witness integrity (${ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_ERA67_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Steady product mode witness started: ${result.era25PostBandAGovernanceSteadyProductModeWitnessExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Steady product mode witness complete: ${result.era25PostBandAGovernanceSteadyProductModeWitnessComplete ? "yes" : "no"}`,
  );
  console.log(
    `Governance chain closed: ${result.era25MarketProofGovernanceChainClosed ? "yes" : "no"}`,
  );
  console.log(`Train sealed: ${result.era25GovernanceTrainSealed ? "yes" : "no"}`);
  console.log(
    `Band A capstone witness active: ${result.bandAGovernanceChainCapstoneWitnessActive ? "yes" : "no"}`,
  );
  console.log(
    `Steady product mode witness active: ${result.postBandAGovernanceSteadyProductModeWitnessActive ? "yes" : "no"}`,
  );

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

#!/usr/bin/env npx tsx
/**
 * Validates era25 Band A governance chain capstone witness integrity.
 */
import {
  evaluateEra25BandAGovernanceChainCapstoneWitnessIntegrity,
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_POLICY_ID,
} from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-integrity-era66";

export { evaluateEra25BandAGovernanceChainCapstoneWitnessIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25BandAGovernanceChainCapstoneWitnessIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 Band A governance chain capstone witness integrity (${ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_ERA66_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Capstone witness started: ${result.era25BandAGovernanceChainCapstoneWitnessExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Capstone witness complete: ${result.era25BandAGovernanceChainCapstoneWitnessComplete ? "yes" : "no"}`,
  );
  console.log(
    `Governance chain closed: ${result.era25MarketProofGovernanceChainClosed ? "yes" : "no"}`,
  );
  console.log(`Train sealed: ${result.era25GovernanceTrainSealed ? "yes" : "no"}`);
  console.log(
    `Commercial ops permanence active: ${result.postTerminalSealCommercialOpsPermanenceActive ? "yes" : "no"}`,
  );
  console.log(
    `Band A capstone witness active: ${result.bandAGovernanceChainCapstoneWitnessActive ? "yes" : "no"}`,
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

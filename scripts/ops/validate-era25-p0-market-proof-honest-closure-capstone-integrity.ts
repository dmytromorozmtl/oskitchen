#!/usr/bin/env npx tsx
/**
 * Validates era25 P0 market proof honest closure capstone integrity.
 */
import {
  evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity,
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_POLICY_ID,
} from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-integrity-era62";

export { evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 P0 market proof honest closure capstone integrity (${ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_ERA62_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Closure started: ${result.era25P0MarketProofHonestClosureCapstoneExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Closure complete: ${result.era25P0MarketProofHonestClosureCapstoneComplete ? "yes" : "no"}`,
  );
  console.log(
    `Governance chain closed: ${result.era25MarketProofGovernanceChainClosed ? "yes" : "no"}`,
  );
  console.log(`P0 proof status: ${result.p0ProofStatus ?? "n/a"}`);
  console.log(`P0 artifact proof_passed: ${result.p0ArtifactProofPassed ? "yes" : "no"}`);

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

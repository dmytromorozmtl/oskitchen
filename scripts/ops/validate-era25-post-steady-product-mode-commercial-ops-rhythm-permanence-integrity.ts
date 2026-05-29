#!/usr/bin/env npx tsx
/**
 * Validates era25 post-steady-product-mode commercial ops rhythm permanence integrity.
 */
import {
  evaluateEra25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrity,
  ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_ERA68_POLICY_ID,
} from "@/lib/commercial/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-era68";

export { evaluateEra25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 post-steady-product-mode commercial ops rhythm permanence integrity (${ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_ERA68_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Rhythm permanence started: ${result.era25PostSteadyProductModeCommercialOpsRhythmPermanenceExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Rhythm permanence complete: ${result.era25PostSteadyProductModeCommercialOpsRhythmPermanenceComplete ? "yes" : "no"}`,
  );
  console.log(
    `Governance chain closed: ${result.era25MarketProofGovernanceChainClosed ? "yes" : "no"}`,
  );
  console.log(`Train sealed: ${result.era25GovernanceTrainSealed ? "yes" : "no"}`);
  console.log(
    `Steady product mode witness active: ${result.postBandAGovernanceSteadyProductModeWitnessActive ? "yes" : "no"}`,
  );
  console.log(
    `Commercial ops rhythm permanence active: ${result.postSteadyProductModeCommercialOpsRhythmPermanenceActive ? "yes" : "no"}`,
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

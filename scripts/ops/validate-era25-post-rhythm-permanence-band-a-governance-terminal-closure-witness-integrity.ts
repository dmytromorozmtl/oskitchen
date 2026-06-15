#!/usr/bin/env npx tsx
/**
 * Validates era25 post-rhythm-permanence Band A governance terminal closure witness integrity.
 */
import {
  evaluateEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity,
  ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_INTEGRITY_ERA69_POLICY_ID,
} from "@/lib/commercial/era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-era69";

export { evaluateEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 post-rhythm-permanence Band A governance terminal closure witness integrity (${ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_INTEGRITY_ERA69_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Terminal closure witness started: ${result.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Terminal closure witness complete: ${result.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessComplete ? "yes" : "no"}`,
  );
  console.log(
    `Governance chain closed: ${result.era25MarketProofGovernanceChainClosed ? "yes" : "no"}`,
  );
  console.log(`Train sealed: ${result.era25GovernanceTrainSealed ? "yes" : "no"}`);
  console.log(
    `Rhythm permanence active: ${result.postSteadyProductModeCommercialOpsRhythmPermanenceActive ? "yes" : "no"}`,
  );
  console.log(
    `Terminal closure witness active: ${result.postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive ? "yes" : "no"}`,
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

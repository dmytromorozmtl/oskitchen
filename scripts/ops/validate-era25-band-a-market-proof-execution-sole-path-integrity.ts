#!/usr/bin/env npx tsx
/**
 * Validates era25 Band A market proof execution sole-path integrity.
 */
import {
  evaluateEra25BandAMarketProofExecutionSolePathIntegrity,
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_POLICY_ID,
} from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-integrity-era61";

export { evaluateEra25BandAMarketProofExecutionSolePathIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25BandAMarketProofExecutionSolePathIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 Band A market proof execution sole-path integrity (${ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_ERA61_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Sole-path started: ${result.era25BandAMarketProofExecutionSolePathExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Sole-path complete: ${result.era25BandAMarketProofExecutionSolePathComplete ? "yes" : "no"}`,
  );
  console.log(
    `Band A locked: ${result.bandAExecutionSolePathLocked ? "yes" : "no"}`,
  );
  console.log(`P0 proof status: ${result.p0ProofStatus ?? "n/a"}`);
  console.log(`GO: ${result.goDecision ?? "n/a"}`);

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

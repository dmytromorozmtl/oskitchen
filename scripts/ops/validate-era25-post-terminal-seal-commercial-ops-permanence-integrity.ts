#!/usr/bin/env npx tsx
/**
 * Validates era25 post-terminal-seal commercial ops permanence integrity.
 */
import {
  evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity,
  ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_ERA65_POLICY_ID,
} from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-integrity-era65";

export { evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 post-terminal-seal commercial ops permanence integrity (${ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_ERA65_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Permanence started: ${result.era25PostTerminalSealCommercialOpsPermanenceExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Permanence complete: ${result.era25PostTerminalSealCommercialOpsPermanenceComplete ? "yes" : "no"}`,
  );
  console.log(
    `Governance chain closed: ${result.era25MarketProofGovernanceChainClosed ? "yes" : "no"}`,
  );
  console.log(`Train sealed: ${result.era25GovernanceTrainSealed ? "yes" : "no"}`);
  console.log(
    `Commercial ops permanence active: ${result.postTerminalSealCommercialOpsPermanenceActive ? "yes" : "no"}`,
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

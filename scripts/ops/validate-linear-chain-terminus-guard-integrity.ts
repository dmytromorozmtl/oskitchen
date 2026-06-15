#!/usr/bin/env npx tsx
/**
 * Validates Linear chain terminus guard integrity — never start without honest Linear path permanently closed.
 */
import {
  evaluateLinearChainTerminusGuardIntegrity,
  LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_POLICY_ID,
} from "@/lib/commercial/linear-chain-terminus-guard-integrity-era41";

export { evaluateLinearChainTerminusGuardIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateLinearChainTerminusGuardIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nLinear chain terminus guard integrity (${LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Step 17 guard started: ${result.linearChainTerminusGuardExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Linear path honest: ${result.linearChainTerminusGuardComplete ? "yes" : "no"}`,
  );
  console.log(`GO: ${result.goDecision ?? "missing"} · GO integrity: ${result.goIntegrityPassed}`);

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

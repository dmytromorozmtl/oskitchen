#!/usr/bin/env npx tsx
/**
 * Validates Linear path permanently closed integrity — never start without honest Commercial pilot path absolute end.
 */
import {
  evaluateLinearPathPermanentlyClosedIntegrity,
  LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_POLICY_ID,
} from "@/lib/commercial/linear-path-permanently-closed-integrity-era40";

export { evaluateLinearPathPermanentlyClosedIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateLinearPathPermanentlyClosedIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nLinear path permanently closed integrity (${LINEAR_PATH_PERMANENTLY_CLOSED_INTEGRITY_ERA40_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Linear path closure started: ${result.linearPathPermanentlyClosedExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Absolute end honest: ${result.linearPathPermanentlyClosedComplete ? "yes" : "no"}`,
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

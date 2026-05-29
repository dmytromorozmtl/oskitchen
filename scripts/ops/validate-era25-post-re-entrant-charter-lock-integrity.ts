#!/usr/bin/env npx tsx
/**
 * Validates era25 post-re-entrant operator charter lock integrity.
 */
import {
  evaluateEra25PostReentrantCharterLockIntegrity,
  ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_POLICY_ID,
} from "@/lib/commercial/era25-post-re-entrant-charter-lock-integrity-era57";

export { evaluateEra25PostReentrantCharterLockIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25PostReentrantCharterLockIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 post-re-entrant charter lock integrity (${ERA25_POST_REENTRANT_CHARTER_LOCK_INTEGRITY_ERA57_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Charter lock started: ${result.era25PostReentrantCharterLockExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Charter lock complete: ${result.era25PostReentrantCharterLockComplete ? "yes" : "no"}`,
  );
  console.log(
    `Re-entrant complete: ${result.sustainedProductEvolutionReentrantComplete ? "yes" : "no"}`,
  );
  console.log(
    `Frozen env mutation: ${result.frozenEnvMutationDetected ? "yes" : "no"}`,
  );
  console.log(`GO: ${result.goDecision ?? "missing"}`);

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

#!/usr/bin/env npx tsx
/**
 * Validates Sustained operational excellence integrity — never start without honest Market leader.
 */
import {
  evaluateSustainedOperationalExcellenceIntegrity,
  SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_ERA33_POLICY_ID,
} from "@/lib/commercial/sustained-operational-excellence-integrity-era33";

export { evaluateSustainedOperationalExcellenceIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateSustainedOperationalExcellenceIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nSustained operational excellence integrity (${SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_ERA33_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(`Sustained ops started: ${result.sustainedOpsExecutionStarted ? "yes" : "no"}`);
  console.log(`Market leader honest: ${result.marketLeaderComplete ? "yes" : "no"}`);
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

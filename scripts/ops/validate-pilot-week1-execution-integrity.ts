#!/usr/bin/env npx tsx
/**
 * Validates Pilot Week 1 execution integrity — never start Week 1 without honest GO.
 */
import {
  evaluatePilotWeek1ExecutionIntegrity,
  PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_POLICY_ID,
} from "@/lib/commercial/pilot-week1-execution-integrity-era28";

export { evaluatePilotWeek1ExecutionIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluatePilotWeek1ExecutionIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nPilot Week 1 execution integrity (${PILOT_WEEK1_EXECUTION_INTEGRITY_ERA28_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(`Week 1 started: ${result.week1ExecutionStarted ? "yes" : "no"}`);
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

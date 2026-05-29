#!/usr/bin/env npx tsx
/**
 * Validates pilot week 1 execution convergence era25 integrity — never attest without honest GO convergence.
 */
import {
  evaluatePilotWeek1ExecutionConvergenceIntegrity,
  PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_POLICY_ID,
} from "@/lib/commercial/pilot-week1-execution-convergence-integrity-era48";

export { evaluatePilotWeek1ExecutionConvergenceIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluatePilotWeek1ExecutionConvergenceIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nPilot week 1 execution convergence integrity (${PILOT_WEEK1_EXECUTION_CONVERGENCE_INTEGRITY_ERA48_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Week 1 convergence started: ${result.pilotWeek1ExecutionConvergenceExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `GO convergence ready honest: ${result.pilotWeek1ExecutionConvergenceComplete ? "yes" : "no"}`,
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

#!/usr/bin/env npx tsx
/**
 * Validates Continuous improvement loop integrity — never start without honest Sustained ops.
 */
import {
  evaluateContinuousImprovementLoopIntegrity,
  CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_POLICY_ID,
} from "@/lib/commercial/continuous-improvement-loop-integrity-era34";

export { evaluateContinuousImprovementLoopIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateContinuousImprovementLoopIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nContinuous improvement loop integrity (${CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_ERA34_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(`Improvement loop started: ${result.improvementLoopExecutionStarted ? "yes" : "no"}`);
  console.log(`Sustained ops honest: ${result.sustainedOpsComplete ? "yes" : "no"}`);
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

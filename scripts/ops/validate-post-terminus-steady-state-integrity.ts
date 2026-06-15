#!/usr/bin/env npx tsx
/**
 * Validates Post-terminus steady state integrity — never start without honest Engineering path terminus.
 */
import {
  evaluatePostTerminusSteadyStateIntegrity,
  POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_POLICY_ID,
} from "@/lib/commercial/post-terminus-steady-state-integrity-era38";

export { evaluatePostTerminusSteadyStateIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluatePostTerminusSteadyStateIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nPost-terminus steady state integrity (${POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Post-terminus steady state started: ${result.postTerminusSteadyStateExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Engineering path terminus honest: ${result.postTerminusSteadyStateComplete ? "yes" : "no"}`,
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

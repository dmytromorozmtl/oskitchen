#!/usr/bin/env npx tsx
/**
 * Validates scale readiness convergence era25 integrity — never attest without honest month 2.
 */
import {
  evaluateScaleReadinessConvergenceIntegrity,
  SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_POLICY_ID,
} from "@/lib/commercial/scale-readiness-convergence-integrity-era50";

export { evaluateScaleReadinessConvergenceIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateScaleReadinessConvergenceIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nScale readiness convergence integrity (${SCALE_READINESS_CONVERGENCE_INTEGRITY_ERA50_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Scale convergence started: ${result.scaleReadinessConvergenceExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Scale convergence ready honest: ${result.scaleReadinessConvergenceComplete ? "yes" : "no"}`,
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

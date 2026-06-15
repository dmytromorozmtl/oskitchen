#!/usr/bin/env npx tsx
/**
 * Validates sustained operational excellence convergence era25 integrity — never attest without honest market leader.
 */
import {
  evaluateSustainedOperationalExcellenceConvergenceIntegrity,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_POLICY_ID,
} from "@/lib/commercial/sustained-operational-excellence-convergence-integrity-era53";

export { evaluateSustainedOperationalExcellenceConvergenceIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateSustainedOperationalExcellenceConvergenceIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nSustained operational excellence convergence integrity (${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_ERA53_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Sustained ops convergence started: ${result.sustainedOperationalExcellenceConvergenceExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Sustained ops convergence ready honest: ${result.sustainedOperationalExcellenceConvergenceComplete ? "yes" : "no"}`,
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

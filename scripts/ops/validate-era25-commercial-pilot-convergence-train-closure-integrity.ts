#!/usr/bin/env npx tsx
/**
 * Validates era25 commercial pilot convergence train closure integrity — rollup era47–era54 baselines.
 */
import {
  evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity,
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_POLICY_ID,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-integrity-era55";

export { evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 commercial pilot convergence train closure integrity (${ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_ERA55_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Train closure started: ${result.era25CommercialPilotConvergenceTrainClosureExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Train closure complete: ${result.era25CommercialPilotConvergenceTrainClosureComplete ? "yes" : "no"}`,
  );
  console.log(
    `Convergence baselines honest: ${result.convergenceIntegrityBaselinesHonestCount}/${result.convergenceIntegrityBaselinesTotalCount}`,
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

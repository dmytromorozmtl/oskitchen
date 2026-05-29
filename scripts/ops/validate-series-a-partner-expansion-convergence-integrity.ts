#!/usr/bin/env npx tsx
/**
 * Validates Series A partner expansion convergence era25 integrity — never attest without honest scale.
 */
import {
  evaluateSeriesAPartnerExpansionConvergenceIntegrity,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_POLICY_ID,
} from "@/lib/commercial/series-a-partner-expansion-convergence-integrity-era51";

export { evaluateSeriesAPartnerExpansionConvergenceIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateSeriesAPartnerExpansionConvergenceIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nSeries A partner expansion convergence integrity (${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_ERA51_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Series A convergence started: ${result.seriesAPartnerExpansionConvergenceExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Series A convergence ready honest: ${result.seriesAPartnerExpansionConvergenceComplete ? "yes" : "no"}`,
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

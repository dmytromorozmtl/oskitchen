#!/usr/bin/env npx tsx
/**
 * Validates Series A / partner expansion integrity — never start Series A without honest Scale.
 */
import {
  evaluateSeriesAPartnerExpansionIntegrity,
  SERIES_A_PARTNER_EXPANSION_INTEGRITY_ERA31_POLICY_ID,
} from "@/lib/commercial/series-a-partner-expansion-integrity-era31";

export { evaluateSeriesAPartnerExpansionIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateSeriesAPartnerExpansionIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nSeries A / partner expansion integrity (${SERIES_A_PARTNER_EXPANSION_INTEGRITY_ERA31_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(`Series A started: ${result.seriesAExecutionStarted ? "yes" : "no"}`);
  console.log(`Scale honest: ${result.scaleComplete ? "yes" : "no"}`);
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

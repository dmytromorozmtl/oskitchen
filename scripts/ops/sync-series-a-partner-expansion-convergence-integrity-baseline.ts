#!/usr/bin/env npx tsx
/**
 * Records Series A partner expansion convergence integrity baseline when scale ready + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateSeriesAPartnerExpansionConvergenceIntegrity } from "@/lib/commercial/series-a-partner-expansion-convergence-integrity-era51";
import {
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
  type SeriesAPartnerExpansionConvergenceIntegrityBaseline,
} from "@/lib/commercial/series-a-partner-expansion-convergence-integrity-era51";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateSeriesAPartnerExpansionConvergenceIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — Series A partner expansion convergence integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.seriesAPartnerExpansionConvergenceComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest scale convergence ready + Series A complete prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: SeriesAPartnerExpansionConvergenceIntegrityBaseline = {
    seriesAPartnerExpansionConvergenceExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    scaleReadinessConvergenceReadyAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${SERIES_A_PARTNER_EXPANSION_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

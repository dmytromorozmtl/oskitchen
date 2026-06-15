#!/usr/bin/env npx tsx
/**
 * Records month 2 market readiness convergence integrity baseline when week 1 ready + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateMonth2MarketReadinessConvergenceIntegrity } from "@/lib/commercial/month2-market-readiness-convergence-integrity-era49";
import {
  MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
  type Month2MarketReadinessConvergenceIntegrityBaseline,
} from "@/lib/commercial/month2-market-readiness-convergence-integrity-era49";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateMonth2MarketReadinessConvergenceIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — month 2 market readiness convergence integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.month2MarketReadinessConvergenceComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest week 1 convergence ready + month 2 complete prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: Month2MarketReadinessConvergenceIntegrityBaseline = {
    month2MarketReadinessConvergenceExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    pilotWeek1ExecutionConvergenceReadyAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

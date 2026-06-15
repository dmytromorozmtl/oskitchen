#!/usr/bin/env npx tsx
/**
 * Records market leader positioning convergence integrity baseline when Series A ready + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateMarketLeaderPositioningConvergenceIntegrity } from "@/lib/commercial/market-leader-positioning-convergence-integrity-era52";
import {
  MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
  type MarketLeaderPositioningConvergenceIntegrityBaseline,
} from "@/lib/commercial/market-leader-positioning-convergence-integrity-era52";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateMarketLeaderPositioningConvergenceIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — market leader positioning convergence integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.marketLeaderPositioningConvergenceComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest Series A convergence ready + market leader complete prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: MarketLeaderPositioningConvergenceIntegrityBaseline = {
    marketLeaderPositioningConvergenceExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    seriesAPartnerExpansionConvergenceReadyAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

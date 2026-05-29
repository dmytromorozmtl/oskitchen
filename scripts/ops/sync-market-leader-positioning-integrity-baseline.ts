#!/usr/bin/env npx tsx
/**
 * Records Market leader positioning integrity baseline when Series A honest + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateMarketLeaderPositioningIntegrity } from "@/lib/commercial/market-leader-positioning-integrity-era32";
import {
  MARKET_LEADER_POSITIONING_INTEGRITY_BASELINE_ARTIFACT,
  type MarketLeaderPositioningIntegrityBaseline,
} from "@/lib/commercial/market-leader-positioning-integrity-era32";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateMarketLeaderPositioningIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — Market leader positioning integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (!integrity.seriesAComplete || integrity.goDecision !== "GO" || !integrity.goIntegrityPassed) {
    console.error("Cannot record baseline — honest Series A + GO prerequisite not met.");
    process.exit(2);
  }

  const baseline: MarketLeaderPositioningIntegrityBaseline = {
    marketLeaderExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    seriesACompleteAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), MARKET_LEADER_POSITIONING_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${MARKET_LEADER_POSITIONING_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

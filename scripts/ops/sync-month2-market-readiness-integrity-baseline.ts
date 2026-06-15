#!/usr/bin/env npx tsx
/**
 * Records Month 2 integrity baseline when Week 1 honest + Month 2 train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateMonth2MarketReadinessIntegrity } from "@/lib/commercial/month2-market-readiness-integrity-era29";
import {
  MONTH2_MARKET_READINESS_INTEGRITY_BASELINE_ARTIFACT,
  type Month2MarketReadinessIntegrityBaseline,
} from "@/lib/commercial/month2-market-readiness-integrity-era29";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateMonth2MarketReadinessIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — Month 2 market readiness integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (!integrity.week1Complete || integrity.goDecision !== "GO" || !integrity.goIntegrityPassed) {
    console.error("Cannot record baseline — honest Week 1 + GO prerequisite not met.");
    process.exit(2);
  }

  const baseline: Month2MarketReadinessIntegrityBaseline = {
    month2ExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    week1CompleteAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), MONTH2_MARKET_READINESS_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${MONTH2_MARKET_READINESS_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

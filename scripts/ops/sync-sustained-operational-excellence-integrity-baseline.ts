#!/usr/bin/env npx tsx
/**
 * Records Sustained operational excellence integrity baseline when Market leader honest + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateSustainedOperationalExcellenceIntegrity } from "@/lib/commercial/sustained-operational-excellence-integrity-era33";
import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_BASELINE_ARTIFACT,
  type SustainedOperationalExcellenceIntegrityBaseline,
} from "@/lib/commercial/sustained-operational-excellence-integrity-era33";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateSustainedOperationalExcellenceIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — Sustained operational excellence integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.marketLeaderComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error("Cannot record baseline — honest Market leader + GO prerequisite not met.");
    process.exit(2);
  }

  const baseline: SustainedOperationalExcellenceIntegrityBaseline = {
    sustainedOpsExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    marketLeaderCompleteAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${SUSTAINED_OPERATIONAL_EXCELLENCE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

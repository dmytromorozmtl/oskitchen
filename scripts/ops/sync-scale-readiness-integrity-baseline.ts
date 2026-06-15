#!/usr/bin/env npx tsx
/**
 * Records Scale readiness integrity baseline when Month 2 honest + Scale train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateScaleReadinessIntegrity } from "@/lib/commercial/scale-readiness-integrity-era30";
import {
  SCALE_READINESS_INTEGRITY_BASELINE_ARTIFACT,
  type ScaleReadinessIntegrityBaseline,
} from "@/lib/commercial/scale-readiness-integrity-era30";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateScaleReadinessIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — Scale readiness integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (!integrity.month2Complete || integrity.goDecision !== "GO" || !integrity.goIntegrityPassed) {
    console.error("Cannot record baseline — honest Month 2 + GO prerequisite not met.");
    process.exit(2);
  }

  const baseline: ScaleReadinessIntegrityBaseline = {
    scaleExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    month2CompleteAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), SCALE_READINESS_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${SCALE_READINESS_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

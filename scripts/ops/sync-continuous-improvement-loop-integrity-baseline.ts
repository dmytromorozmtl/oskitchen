#!/usr/bin/env npx tsx
/**
 * Records Continuous improvement loop integrity baseline when Sustained ops honest + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateContinuousImprovementLoopIntegrity } from "@/lib/commercial/continuous-improvement-loop-integrity-era34";
import {
  CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_BASELINE_ARTIFACT,
  type ContinuousImprovementLoopIntegrityBaseline,
} from "@/lib/commercial/continuous-improvement-loop-integrity-era34";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateContinuousImprovementLoopIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — Continuous improvement loop integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.sustainedOpsComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error("Cannot record baseline — honest Sustained ops + GO prerequisite not met.");
    process.exit(2);
  }

  const baseline: ContinuousImprovementLoopIntegrityBaseline = {
    improvementLoopExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    sustainedOpsCompleteAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${CONTINUOUS_IMPROVEMENT_LOOP_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

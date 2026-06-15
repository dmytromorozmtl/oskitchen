#!/usr/bin/env npx tsx
/**
 * Records scale readiness convergence integrity baseline when month 2 ready + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateScaleReadinessConvergenceIntegrity } from "@/lib/commercial/scale-readiness-convergence-integrity-era50";
import {
  SCALE_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
  type ScaleReadinessConvergenceIntegrityBaseline,
} from "@/lib/commercial/scale-readiness-convergence-integrity-era50";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateScaleReadinessConvergenceIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — scale readiness convergence integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.scaleReadinessConvergenceComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest month 2 convergence ready + scale complete prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: ScaleReadinessConvergenceIntegrityBaseline = {
    scaleReadinessConvergenceExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    month2MarketReadinessConvergenceReadyAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), SCALE_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${SCALE_READINESS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

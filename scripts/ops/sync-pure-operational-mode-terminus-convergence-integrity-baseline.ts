#!/usr/bin/env npx tsx
/**
 * Records pure operational mode terminus convergence integrity baseline when sustained ops ready + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluatePureOperationalModeTerminusConvergenceIntegrity } from "@/lib/commercial/pure-operational-mode-terminus-convergence-integrity-era54";
import {
  PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
  type PureOperationalModeTerminusConvergenceIntegrityBaseline,
} from "@/lib/commercial/pure-operational-mode-terminus-convergence-integrity-era54";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluatePureOperationalModeTerminusConvergenceIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — pure operational mode terminus convergence integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.pureOperationalModeTerminusConvergenceComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest sustained ops convergence ready + pure operational mode active prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: PureOperationalModeTerminusConvergenceIntegrityBaseline = {
    pureOperationalModeTerminusConvergenceExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    sustainedOperationalExcellenceConvergenceReadyAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${PURE_OPERATIONAL_MODE_TERMINUS_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

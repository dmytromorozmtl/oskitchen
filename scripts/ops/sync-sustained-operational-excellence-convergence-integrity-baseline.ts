#!/usr/bin/env npx tsx
/**
 * Records sustained operational excellence convergence integrity baseline when market leader ready + train active.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateSustainedOperationalExcellenceConvergenceIntegrity } from "@/lib/commercial/sustained-operational-excellence-convergence-integrity-era53";
import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT,
  type SustainedOperationalExcellenceConvergenceIntegrityBaseline,
} from "@/lib/commercial/sustained-operational-excellence-convergence-integrity-era53";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateSustainedOperationalExcellenceConvergenceIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — sustained operational excellence convergence integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.sustainedOperationalExcellenceConvergenceComplete ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — honest market leader convergence ready + sustained ops complete prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: SustainedOperationalExcellenceConvergenceIntegrityBaseline = {
    sustainedOperationalExcellenceConvergenceExecutionHonest: true,
    recordedAt: new Date().toISOString(),
    marketLeaderPositioningConvergenceReadyAttested: true,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

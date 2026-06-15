#!/usr/bin/env npx tsx
/**
 * Records era25 commercial pilot convergence train closure integrity baseline when pure ops active + all era47–era54 baselines honest.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity } from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-integrity-era55";
import {
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_BASELINE_ARTIFACT,
  type Era25CommercialPilotConvergenceTrainClosureIntegrityBaseline,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-integrity-era55";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25CommercialPilotConvergenceTrainClosureIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — era25 commercial pilot convergence train closure integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25CommercialPilotConvergenceTrainClosureComplete ||
    !integrity.pureOperationalModeEra25Active ||
    integrity.goDecision !== "GO" ||
    !integrity.goIntegrityPassed ||
    integrity.convergenceIntegrityBaselinesHonestCount !==
      integrity.convergenceIntegrityBaselinesTotalCount
  ) {
    console.error(
      "Cannot record baseline — pure operational mode active + all era47–era54 convergence integrity baselines honest prerequisite not met.",
    );
    process.exit(2);
  }

  const baseline: Era25CommercialPilotConvergenceTrainClosureIntegrityBaseline = {
    era25CommercialPilotConvergenceTrainClosureHonest: true,
    recordedAt: new Date().toISOString(),
    pureOperationalModeActiveAttested: true,
    convergenceIntegrityBaselineCount: integrity.convergenceIntegrityBaselinesTotalCount,
    goDecision: "GO",
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(
    process.cwd(),
    ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_BASELINE_ARTIFACT,
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

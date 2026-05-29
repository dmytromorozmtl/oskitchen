#!/usr/bin/env npx tsx
/**
 * Records era25 commercial pilot convergence train capstone integrity baseline when steady-state lock PASS.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity } from "@/lib/commercial/era25-commercial-pilot-convergence-train-capstone-integrity-era59";
import { ERA25_FROZEN_AFTER_TRAIN_CAPSTONE_ENV_KEYS } from "@/lib/commercial/era25-commercial-pilot-convergence-train-capstone-phases-era59";
import {
  ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_BASELINE_ARTIFACT,
  type Era25CommercialPilotConvergenceTrainCapstoneIntegrityBaseline,
} from "@/lib/commercial/era25-commercial-pilot-convergence-train-capstone-integrity-era59";
import { loadP0StagingProofArtifact } from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25CommercialPilotConvergenceTrainCapstoneIntegrity();
  const diskP0 = loadP0StagingProofArtifact();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — era25 train capstone integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25CommercialPilotConvergenceTrainCapstoneComplete ||
    !integrity.era25SteadyStateOperatorLoopLockComplete ||
    integrity.frozenEnvMutationDetected ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — steady-state lock + capstone prerequisites not met.",
    );
    process.exit(2);
  }

  const baseline: Era25CommercialPilotConvergenceTrainCapstoneIntegrityBaseline = {
    era25CommercialPilotConvergenceTrainCapstoneHonest: true,
    recordedAt: new Date().toISOString(),
    steadyStateLockHonestAttested: true,
    p0ProofStatusAtCapstone: diskP0?.p0ProofStatus ?? "awaiting_ops_credentials",
    goDecision: integrity.goDecision ?? "NO-GO",
    frozenEnvKeyCount: ERA25_FROZEN_AFTER_TRAIN_CAPSTONE_ENV_KEYS.length,
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(
    process.cwd(),
    ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_BASELINE_ARTIFACT,
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

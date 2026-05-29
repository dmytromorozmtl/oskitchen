#!/usr/bin/env npx tsx
/**
 * Records era25 post-steady-product-mode commercial ops rhythm permanence integrity baseline when steady product mode witness is honest.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrity } from "@/lib/commercial/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-era68";
import { ERA25_FROZEN_AFTER_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ENV_KEYS } from "@/lib/commercial/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-phases-era68";
import {
  ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_BASELINE_ARTIFACT,
  type Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityBaseline,
} from "@/lib/commercial/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-integrity-era68";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrity();

  if (!integrity.integrityPassed) {
    console.error(
      "Cannot record baseline — era25 post-steady-product-mode commercial ops rhythm permanence integrity FAIL.",
    );
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25PostSteadyProductModeCommercialOpsRhythmPermanenceComplete ||
    !integrity.era25MarketProofGovernanceChainClosed ||
    !integrity.era25PostBandAGovernanceSteadyProductModeWitnessIntegrityPassed ||
    !integrity.era25GovernanceTrainSealed ||
    !integrity.postBandAGovernanceSteadyProductModeWitnessActive ||
    !integrity.continuousImprovementLoopIntegrityPassed ||
    integrity.governanceReopenClaimed
  ) {
    console.error(
      "Cannot record baseline — steady product mode witness + improvement loop + rhythm permanence prerequisites not met.",
    );
    process.exit(2);
  }

  const baseline: Era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityBaseline = {
    era25PostSteadyProductModeCommercialOpsRhythmPermanenceHonest: true,
    recordedAt: new Date().toISOString(),
    era25MarketProofGovernanceChainClosedAtRhythmPermanence: true,
    era25GovernanceTrainSealedAtRhythmPermanence: true,
    postBandAGovernanceSteadyProductModeWitnessActiveAtRhythmPermanence: true,
    p0ProofStatusAtRhythmPermanence: "proof_passed",
    goDecision: integrity.goDecision ?? "NO-GO",
    frozenEnvKeyCount: ERA25_FROZEN_AFTER_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ENV_KEYS.length,
    postSteadyProductModeCommercialOpsRhythmPermanenceActive: true,
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(
    process.cwd(),
    ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_BASELINE_ARTIFACT,
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

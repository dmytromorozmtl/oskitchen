#!/usr/bin/env npx tsx
/**
 * Records era25 post-band-a-governance steady product mode witness integrity baseline when capstone witness is honest.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity } from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-integrity-era67";
import { ERA25_FROZEN_AFTER_STEADY_PRODUCT_MODE_WITNESS_ENV_KEYS } from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-phases-era67";
import {
  ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
  type Era25PostBandAGovernanceSteadyProductModeWitnessIntegrityBaseline,
} from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-integrity-era67";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25PostBandAGovernanceSteadyProductModeWitnessIntegrity();

  if (!integrity.integrityPassed) {
    console.error(
      "Cannot record baseline — era25 post-band-a-governance steady product mode witness integrity FAIL.",
    );
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25PostBandAGovernanceSteadyProductModeWitnessComplete ||
    !integrity.era25MarketProofGovernanceChainClosed ||
    !integrity.era25BandAGovernanceChainCapstoneWitnessIntegrityPassed ||
    !integrity.era25GovernanceTrainSealed ||
    !integrity.bandAGovernanceChainCapstoneWitnessActive ||
    !integrity.continuousImprovementLoopIntegrityPassed ||
    integrity.governanceReopenClaimed
  ) {
    console.error(
      "Cannot record baseline — Band A capstone witness + improvement loop + steady product mode witness prerequisites not met.",
    );
    process.exit(2);
  }

  const baseline: Era25PostBandAGovernanceSteadyProductModeWitnessIntegrityBaseline = {
    era25PostBandAGovernanceSteadyProductModeWitnessHonest: true,
    recordedAt: new Date().toISOString(),
    era25MarketProofGovernanceChainClosedAtSteadyProductMode: true,
    era25GovernanceTrainSealedAtSteadyProductMode: true,
    bandAGovernanceChainCapstoneWitnessActiveAtSteadyProductMode: true,
    p0ProofStatusAtSteadyProductMode: "proof_passed",
    goDecision: integrity.goDecision ?? "NO-GO",
    frozenEnvKeyCount: ERA25_FROZEN_AFTER_STEADY_PRODUCT_MODE_WITNESS_ENV_KEYS.length,
    postBandAGovernanceSteadyProductModeWitnessActive: true,
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(
    process.cwd(),
    ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

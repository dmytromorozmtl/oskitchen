#!/usr/bin/env npx tsx
/**
 * Records era25 P0 market proof honest closure capstone integrity baseline when proof_passed is honest.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity } from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-integrity-era62";
import { ERA25_FROZEN_AFTER_CLOSURE_CAPSTONE_ENV_KEYS } from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-phases-era62";
import {
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_BASELINE_ARTIFACT,
  type Era25P0MarketProofHonestClosureCapstoneIntegrityBaseline,
} from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-integrity-era62";
import { loadP0StagingProofArtifact } from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25P0MarketProofHonestClosureCapstoneIntegrity();
  const diskP0 = loadP0StagingProofArtifact();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — era25 P0 closure capstone integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25P0MarketProofHonestClosureCapstoneComplete ||
    !integrity.bandAExecutionSolePathLocked ||
    !integrity.p0ArtifactProofPassed ||
    integrity.frozenEnvMutationDetected ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — sole-path lock + honest proof_passed artifact + closure prerequisites not met.",
    );
    process.exit(2);
  }

  const baseline: Era25P0MarketProofHonestClosureCapstoneIntegrityBaseline = {
    era25P0MarketProofHonestClosureCapstoneHonest: true,
    recordedAt: new Date().toISOString(),
    bandAExecutionSolePathLockedAtClosure: true,
    p0ProofStatusAtClosure: "proof_passed",
    goDecision: integrity.goDecision ?? "NO-GO",
    frozenEnvKeyCount: ERA25_FROZEN_AFTER_CLOSURE_CAPSTONE_ENV_KEYS.length,
    era25MarketProofGovernanceChainClosed: true,
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(
    process.cwd(),
    ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_BASELINE_ARTIFACT,
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

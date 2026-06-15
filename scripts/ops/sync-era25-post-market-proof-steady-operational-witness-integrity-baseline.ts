#!/usr/bin/env npx tsx
/**
 * Records era25 post-market-proof steady operational witness integrity baseline when closure capstone is honest.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25PostMarketProofSteadyOperationalWitnessIntegrity } from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-integrity-era63";
import { ERA25_FROZEN_AFTER_WITNESS_ENV_KEYS } from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-phases-era63";
import {
  ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
  type Era25PostMarketProofSteadyOperationalWitnessIntegrityBaseline,
} from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-integrity-era63";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25PostMarketProofSteadyOperationalWitnessIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — era25 post-market-proof steady operational witness integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25PostMarketProofSteadyOperationalWitnessComplete ||
    !integrity.era25MarketProofGovernanceChainClosed ||
    !integrity.era25P0MarketProofHonestClosureCapstoneIntegrityPassed ||
    !integrity.continuousImprovementLoopIntegrityPassed ||
    integrity.governanceReopenClaimed
  ) {
    console.error(
      "Cannot record baseline — closure capstone + improvement loop + witness prerequisites not met.",
    );
    process.exit(2);
  }

  const baseline: Era25PostMarketProofSteadyOperationalWitnessIntegrityBaseline = {
    era25PostMarketProofSteadyOperationalWitnessHonest: true,
    recordedAt: new Date().toISOString(),
    era25MarketProofGovernanceChainClosedAtWitness: true,
    p0ProofStatusAtWitness: "proof_passed",
    goDecision: integrity.goDecision ?? "NO-GO",
    frozenEnvKeyCount: ERA25_FROZEN_AFTER_WITNESS_ENV_KEYS.length,
    postMarketProofSteadyOpsWitnessActive: true,
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(
    process.cwd(),
    ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

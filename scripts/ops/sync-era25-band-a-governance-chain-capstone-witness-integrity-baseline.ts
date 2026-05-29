#!/usr/bin/env npx tsx
/**
 * Records era25 Band A governance chain capstone witness integrity baseline when permanence is honest.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25BandAGovernanceChainCapstoneWitnessIntegrity } from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-integrity-era66";
import { ERA25_FROZEN_AFTER_CAPSTONE_WITNESS_ENV_KEYS } from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-phases-era66";
import {
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
  type Era25BandAGovernanceChainCapstoneWitnessIntegrityBaseline,
} from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-integrity-era66";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25BandAGovernanceChainCapstoneWitnessIntegrity();

  if (!integrity.integrityPassed) {
    console.error(
      "Cannot record baseline — era25 Band A governance chain capstone witness integrity FAIL.",
    );
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25BandAGovernanceChainCapstoneWitnessComplete ||
    !integrity.era25MarketProofGovernanceChainClosed ||
    !integrity.era25PostTerminalSealCommercialOpsPermanenceIntegrityPassed ||
    !integrity.era25GovernanceTrainSealed ||
    !integrity.postTerminalSealCommercialOpsPermanenceActive ||
    !integrity.continuousImprovementLoopIntegrityPassed ||
    integrity.governanceReopenClaimed
  ) {
    console.error(
      "Cannot record baseline — commercial ops permanence + improvement loop + capstone witness prerequisites not met.",
    );
    process.exit(2);
  }

  const baseline: Era25BandAGovernanceChainCapstoneWitnessIntegrityBaseline = {
    era25BandAGovernanceChainCapstoneWitnessHonest: true,
    recordedAt: new Date().toISOString(),
    era25MarketProofGovernanceChainClosedAtCapstone: true,
    era25GovernanceTrainSealedAtCapstone: true,
    postTerminalSealCommercialOpsPermanenceActiveAtCapstone: true,
    p0ProofStatusAtCapstone: "proof_passed",
    goDecision: integrity.goDecision ?? "NO-GO",
    frozenEnvKeyCount: ERA25_FROZEN_AFTER_CAPSTONE_WITNESS_ENV_KEYS.length,
    bandAGovernanceChainCapstoneWitnessActive: true,
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(
    process.cwd(),
    ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

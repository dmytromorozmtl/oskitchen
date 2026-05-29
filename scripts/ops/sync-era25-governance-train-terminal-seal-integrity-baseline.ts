#!/usr/bin/env npx tsx
/**
 * Records era25 governance train terminal seal integrity baseline when steady witness is honest.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25GovernanceTrainTerminalSealIntegrity } from "@/lib/commercial/era25-governance-train-terminal-seal-integrity-era64";
import { ERA25_FROZEN_AFTER_TERMINAL_SEAL_ENV_KEYS } from "@/lib/commercial/era25-governance-train-terminal-seal-phases-era64";
import {
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_BASELINE_ARTIFACT,
  type Era25GovernanceTrainTerminalSealIntegrityBaseline,
} from "@/lib/commercial/era25-governance-train-terminal-seal-integrity-era64";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25GovernanceTrainTerminalSealIntegrity();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — era25 governance train terminal seal integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25GovernanceTrainTerminalSealComplete ||
    !integrity.era25MarketProofGovernanceChainClosed ||
    !integrity.era25PostMarketProofSteadyOperationalWitnessIntegrityPassed ||
    !integrity.postMarketProofSteadyOpsWitnessActive ||
    !integrity.continuousImprovementLoopIntegrityPassed ||
    integrity.governanceReopenClaimed
  ) {
    console.error(
      "Cannot record baseline — steady witness + improvement loop + seal prerequisites not met.",
    );
    process.exit(2);
  }

  const baseline: Era25GovernanceTrainTerminalSealIntegrityBaseline = {
    era25GovernanceTrainTerminalSealHonest: true,
    recordedAt: new Date().toISOString(),
    era25MarketProofGovernanceChainClosedAtSeal: true,
    postMarketProofSteadyOpsWitnessActiveAtSeal: true,
    p0ProofStatusAtSeal: "proof_passed",
    goDecision: integrity.goDecision ?? "NO-GO",
    frozenEnvKeyCount: ERA25_FROZEN_AFTER_TERMINAL_SEAL_ENV_KEYS.length,
    era25GovernanceTrainSealed: true,
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

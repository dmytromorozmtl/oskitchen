#!/usr/bin/env npx tsx
/**
 * Records era25 post-terminal-seal commercial ops permanence integrity baseline when terminal seal is honest.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-integrity-era65";
import { ERA25_FROZEN_AFTER_PERMANENCE_ENV_KEYS } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-phases-era65";
import {
  ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_BASELINE_ARTIFACT,
  type Era25PostTerminalSealCommercialOpsPermanenceIntegrityBaseline,
} from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-integrity-era65";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25PostTerminalSealCommercialOpsPermanenceIntegrity();

  if (!integrity.integrityPassed) {
    console.error(
      "Cannot record baseline — era25 post-terminal-seal commercial ops permanence integrity FAIL.",
    );
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25PostTerminalSealCommercialOpsPermanenceComplete ||
    !integrity.era25MarketProofGovernanceChainClosed ||
    !integrity.era25GovernanceTrainTerminalSealIntegrityPassed ||
    !integrity.era25GovernanceTrainSealed ||
    !integrity.postMarketProofSteadyOpsWitnessActive ||
    !integrity.continuousImprovementLoopIntegrityPassed ||
    integrity.governanceReopenClaimed
  ) {
    console.error(
      "Cannot record baseline — terminal seal + steady witness + improvement loop + permanence prerequisites not met.",
    );
    process.exit(2);
  }

  const baseline: Era25PostTerminalSealCommercialOpsPermanenceIntegrityBaseline = {
    era25PostTerminalSealCommercialOpsPermanenceHonest: true,
    recordedAt: new Date().toISOString(),
    era25MarketProofGovernanceChainClosedAtPermanence: true,
    era25GovernanceTrainSealedAtPermanence: true,
    postMarketProofSteadyOpsWitnessActiveAtPermanence: true,
    p0ProofStatusAtPermanence: "proof_passed",
    goDecision: integrity.goDecision ?? "NO-GO",
    frozenEnvKeyCount: ERA25_FROZEN_AFTER_PERMANENCE_ENV_KEYS.length,
    postTerminalSealCommercialOpsPermanenceActive: true,
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(
    process.cwd(),
    ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_BASELINE_ARTIFACT,
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

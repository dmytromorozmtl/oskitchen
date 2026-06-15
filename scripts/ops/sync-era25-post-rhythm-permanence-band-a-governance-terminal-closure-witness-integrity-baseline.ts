#!/usr/bin/env npx tsx
/**
 * Records era25 post-rhythm-permanence Band A governance terminal closure witness integrity baseline when rhythm permanence is honest.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity } from "@/lib/commercial/era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-era69";
import { ERA25_FROZEN_AFTER_TERMINAL_CLOSURE_WITNESS_ENV_KEYS } from "@/lib/commercial/era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-phases-era69";
import {
  ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
  type Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityBaseline,
} from "@/lib/commercial/era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-integrity-era69";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity();

  if (!integrity.integrityPassed) {
    console.error(
      "Cannot record baseline — era25 post-rhythm-permanence Band A governance terminal closure witness integrity FAIL.",
    );
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessComplete ||
    !integrity.era25MarketProofGovernanceChainClosed ||
    !integrity.era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityPassed ||
    !integrity.era25GovernanceTrainSealed ||
    !integrity.postSteadyProductModeCommercialOpsRhythmPermanenceActive ||
    !integrity.continuousImprovementLoopIntegrityPassed ||
    integrity.governanceReopenClaimed
  ) {
    console.error(
      "Cannot record baseline — rhythm permanence + improvement loop + terminal closure witness prerequisites not met.",
    );
    process.exit(2);
  }

  const baseline: Era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityBaseline = {
    era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessHonest: true,
    recordedAt: new Date().toISOString(),
    era25MarketProofGovernanceChainClosedAtTerminalClosure: true,
    era25GovernanceTrainSealedAtTerminalClosure: true,
    postSteadyProductModeCommercialOpsRhythmPermanenceActiveAtTerminalClosure: true,
    p0ProofStatusAtTerminalClosure: "proof_passed",
    goDecision: integrity.goDecision ?? "NO-GO",
    frozenEnvKeyCount: ERA25_FROZEN_AFTER_TERMINAL_CLOSURE_WITNESS_ENV_KEYS.length,
    postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive: true,
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(
    process.cwd(),
    ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_INTEGRITY_BASELINE_ARTIFACT,
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_INTEGRITY_BASELINE_ARTIFACT}`,
  );
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

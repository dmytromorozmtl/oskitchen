#!/usr/bin/env npx tsx
/**
 * Records era25 convergence governance terminus freeze integrity baseline when train capstone PASS.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity } from "@/lib/commercial/era25-convergence-governance-terminus-freeze-integrity-era60";
import { ERA25_FROZEN_AFTER_GOVERNANCE_TERMINUS_FREEZE_ENV_KEYS } from "@/lib/commercial/era25-convergence-governance-terminus-freeze-phases-era60";
import {
  ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_BASELINE_ARTIFACT,
  type Era25ConvergenceGovernanceTerminusFreezeIntegrityBaseline,
} from "@/lib/commercial/era25-convergence-governance-terminus-freeze-integrity-era60";
import { loadP0StagingProofArtifact } from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25ConvergenceGovernanceTerminusFreezeIntegrity();
  const diskP0 = loadP0StagingProofArtifact();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — era25 governance terminus freeze integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25ConvergenceGovernanceTerminusFreezeComplete ||
    !integrity.era25CommercialPilotConvergenceTrainCapstoneComplete ||
    integrity.frozenEnvMutationDetected ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — train capstone + terminus freeze prerequisites not met.",
    );
    process.exit(2);
  }

  const baseline: Era25ConvergenceGovernanceTerminusFreezeIntegrityBaseline = {
    era25ConvergenceGovernanceTerminusFreezeHonest: true,
    recordedAt: new Date().toISOString(),
    trainCapstoneHonestAttested: true,
    p0ProofStatusAtFreeze: diskP0?.p0ProofStatus ?? "awaiting_ops_credentials",
    goDecision: integrity.goDecision ?? "NO-GO",
    frozenEnvKeyCount: ERA25_FROZEN_AFTER_GOVERNANCE_TERMINUS_FREEZE_ENV_KEYS.length,
    era25ProductConvergenceSurfacesSuppressed: true,
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(
    process.cwd(),
    ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_BASELINE_ARTIFACT,
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

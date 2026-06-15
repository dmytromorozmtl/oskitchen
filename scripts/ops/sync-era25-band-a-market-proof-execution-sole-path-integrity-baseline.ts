#!/usr/bin/env npx tsx
/**
 * Records era25 Band A market proof execution sole-path integrity baseline when terminus freeze PASS.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateEra25BandAMarketProofExecutionSolePathIntegrity } from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-integrity-era61";
import { ERA25_FROZEN_AFTER_SOLE_PATH_ENV_KEYS } from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-phases-era61";
import {
  ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_BASELINE_ARTIFACT,
  type Era25BandAMarketProofExecutionSolePathIntegrityBaseline,
} from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-integrity-era61";
import { loadP0StagingProofArtifact } from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";

function main() {
  const write = process.argv.includes("--write");
  const integrity = evaluateEra25BandAMarketProofExecutionSolePathIntegrity();
  const diskP0 = loadP0StagingProofArtifact();

  if (!integrity.integrityPassed) {
    console.error("Cannot record baseline — era25 Band A sole-path integrity FAIL.");
    for (const violation of integrity.violations) {
      console.error(`  [${violation.id}] ${violation.detail}`);
    }
    process.exit(2);
  }

  if (
    !integrity.era25BandAMarketProofExecutionSolePathComplete ||
    !integrity.era25ConvergenceGovernanceTerminusFreezeComplete ||
    integrity.frozenEnvMutationDetected ||
    !integrity.goIntegrityPassed
  ) {
    console.error(
      "Cannot record baseline — governance terminus freeze + sole-path prerequisites not met.",
    );
    process.exit(2);
  }

  const baseline: Era25BandAMarketProofExecutionSolePathIntegrityBaseline = {
    era25BandAMarketProofExecutionSolePathHonest: true,
    recordedAt: new Date().toISOString(),
    governanceTerminusFreezeHonestAttested: true,
    p0ProofStatusAtSolePath: diskP0?.p0ProofStatus ?? "awaiting_ops_credentials",
    goDecision: integrity.goDecision ?? "NO-GO",
    frozenEnvKeyCount: ERA25_FROZEN_AFTER_SOLE_PATH_ENV_KEYS.length,
    bandAExecutionSolePathLocked: true,
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(
    process.cwd(),
    ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_BASELINE_ARTIFACT,
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

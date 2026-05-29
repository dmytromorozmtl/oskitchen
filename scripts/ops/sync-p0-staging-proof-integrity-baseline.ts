#!/usr/bin/env npx tsx
/**
 * Records P0 proof integrity baseline when proof_passed — used to detect regression in CI.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { loadP0StagingProofArtifact } from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";
import {
  P0_STAGING_PROOF_INTEGRITY_BASELINE_ARTIFACT,
  type P0StagingProofIntegrityBaseline,
} from "@/lib/commercial/p0-staging-proof-integrity-era28";

function main() {
  const write = process.argv.includes("--write");
  const artifact = loadP0StagingProofArtifact();

  if (!artifact) {
    console.error(`Missing P0 artifact — run smoke:p0-staging-proof-unblock first.`);
    process.exit(1);
  }

  if (artifact.p0ProofStatus !== "proof_passed") {
    console.error(
      `Cannot record baseline — p0ProofStatus is ${artifact.p0ProofStatus}, not proof_passed.`,
    );
    process.exit(2);
  }

  const baseline: P0StagingProofIntegrityBaseline = {
    p0ProofStatus: "proof_passed",
    recordedAt: new Date().toISOString(),
    commitSha: artifact.commitSha,
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), P0_STAGING_PROOF_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${P0_STAGING_PROOF_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

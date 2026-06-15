#!/usr/bin/env npx tsx
/**
 * Records Tier 2 proof integrity baseline when proof_passed — CI regression guard.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import {
  TIER2_STAGING_GOLDEN_PATH_INTEGRITY_BASELINE_ARTIFACT,
  type Tier2StagingGoldenPathIntegrityBaseline,
} from "@/lib/commercial/tier2-staging-golden-path-integrity-era28";

function readTier2Artifact() {
  const path = join(process.cwd(), TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as {
    tier2ProofStatus?: string;
    commitSha?: string | null;
  };
}

function main() {
  const write = process.argv.includes("--write");
  const artifact = readTier2Artifact();

  if (!artifact) {
    console.error(`Missing ${TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT}`);
    process.exit(1);
  }

  if (artifact.tier2ProofStatus !== "proof_passed") {
    console.error(
      `Cannot record baseline — tier2ProofStatus is ${artifact.tier2ProofStatus ?? "missing"}, not proof_passed.`,
    );
    process.exit(2);
  }

  const baseline: Tier2StagingGoldenPathIntegrityBaseline = {
    tier2ProofStatus: "proof_passed",
    recordedAt: new Date().toISOString(),
    commitSha: artifact.commitSha ?? null,
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), TIER2_STAGING_GOLDEN_PATH_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${TIER2_STAGING_GOLDEN_PATH_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

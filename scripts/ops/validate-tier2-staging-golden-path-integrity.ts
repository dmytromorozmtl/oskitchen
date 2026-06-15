#!/usr/bin/env npx tsx
/**
 * Validates Tier 2 golden path artifact integrity — never fake proof_passed.
 */
import {
  evaluateTier2StagingGoldenPathIntegrity,
  TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_POLICY_ID,
} from "@/lib/commercial/tier2-staging-golden-path-integrity-era28";

export { evaluateTier2StagingGoldenPathIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateTier2StagingGoldenPathIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nTier 2 staging golden path integrity (${TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(`Artifact: ${result.artifactPresent ? result.tier2ProofStatus : "missing"}`);
  if (result.recomputedProofStatus) {
    console.log(`Recomputed: ${result.recomputedProofStatus}`);
  }
  if (result.p0ProofStatusLive) {
    console.log(`P0 live: ${result.p0ProofStatusLive}`);
  }

  for (const violation of result.violations) {
    console.log(`  [${violation.id}] ${violation.detail}`);
  }

  console.log("\nRecommended:");
  for (const command of result.recommendedCommands) {
    console.log(`  ${command}`);
  }
  console.log("");
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

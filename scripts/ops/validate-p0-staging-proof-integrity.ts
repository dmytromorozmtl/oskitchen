#!/usr/bin/env npx tsx
/**
 * Validates P0 staging proof artifact integrity — never fake PASS in committed JSON.
 */
import {
  evaluateP0StagingProofIntegrity,
  P0_STAGING_PROOF_INTEGRITY_ERA28_POLICY_ID,
} from "@/lib/commercial/p0-staging-proof-integrity-era28";

export { evaluateP0StagingProofIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateP0StagingProofIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(`\nP0 staging proof integrity (${P0_STAGING_PROOF_INTEGRITY_ERA28_POLICY_ID})\n`);
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(`Artifact: ${result.artifactPresent ? result.p0ProofStatus : "missing"}`);
  if (result.recomputedProofStatus) {
    console.log(`Recomputed: ${result.recomputedProofStatus}`);
  }
  if (result.overall) {
    console.log(`Overall: ${result.overall}`);
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

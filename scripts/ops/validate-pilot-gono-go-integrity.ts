#!/usr/bin/env npx tsx
/**
 * Validates pilot GO/NO-GO artifact integrity — never fake GO.
 */
import {
  evaluatePilotGoNoGoIntegrity,
  PILOT_GONOGO_INTEGRITY_ERA28_POLICY_ID,
} from "@/lib/commercial/pilot-gono-go-integrity-era28";

export { evaluatePilotGoNoGoIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluatePilotGoNoGoIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(`\nPilot GO/NO-GO integrity (${PILOT_GONOGO_INTEGRITY_ERA28_POLICY_ID})\n`);
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(`Artifact: ${result.artifactPresent ? result.decision : "missing"}`);
  if (result.recomputedDecision) {
    console.log(`Recomputed: ${result.recomputedDecision}`);
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

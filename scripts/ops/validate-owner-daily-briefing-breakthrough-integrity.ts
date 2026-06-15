#!/usr/bin/env npx tsx
/**
 * Validates owner daily briefing breakthrough era25 integrity — never attest without honest blueprint.
 */
import {
  evaluateOwnerDailyBriefingBreakthroughIntegrity,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_POLICY_ID,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-integrity-era46";

export { evaluateOwnerDailyBriefingBreakthroughIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateOwnerDailyBriefingBreakthroughIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nOwner daily briefing breakthrough integrity (${OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Breakthrough started: ${result.ownerDailyBriefingBreakthroughExecutionStarted ? "yes" : "no"}`,
  );
  console.log(`Blueprint ready honest: ${result.ownerDailyBriefingBreakthroughComplete ? "yes" : "no"}`);
  console.log(`GO: ${result.goDecision ?? "missing"} · GO integrity: ${result.goIntegrityPassed}`);

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

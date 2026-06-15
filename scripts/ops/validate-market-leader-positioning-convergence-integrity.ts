#!/usr/bin/env npx tsx
/**
 * Validates market leader positioning convergence era25 integrity — never attest without honest Series A.
 */
import {
  evaluateMarketLeaderPositioningConvergenceIntegrity,
  MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_POLICY_ID,
} from "@/lib/commercial/market-leader-positioning-convergence-integrity-era52";

export { evaluateMarketLeaderPositioningConvergenceIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateMarketLeaderPositioningConvergenceIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nMarket leader positioning convergence integrity (${MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Market leader convergence started: ${result.marketLeaderPositioningConvergenceExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Market leader convergence ready honest: ${result.marketLeaderPositioningConvergenceComplete ? "yes" : "no"}`,
  );
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

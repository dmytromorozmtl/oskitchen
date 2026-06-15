#!/usr/bin/env npx tsx
/**
 * Validates Market leader positioning integrity — never start without honest Series A.
 */
import {
  evaluateMarketLeaderPositioningIntegrity,
  MARKET_LEADER_POSITIONING_INTEGRITY_ERA32_POLICY_ID,
} from "@/lib/commercial/market-leader-positioning-integrity-era32";

export { evaluateMarketLeaderPositioningIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateMarketLeaderPositioningIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nMarket leader positioning integrity (${MARKET_LEADER_POSITIONING_INTEGRITY_ERA32_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(`Market leader started: ${result.marketLeaderExecutionStarted ? "yes" : "no"}`);
  console.log(`Series A honest: ${result.seriesAComplete ? "yes" : "no"}`);
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

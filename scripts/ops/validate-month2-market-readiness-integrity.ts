#!/usr/bin/env npx tsx
/**
 * Validates Month 2 market readiness integrity — never start Month 2 without honest Week 1.
 */
import {
  evaluateMonth2MarketReadinessIntegrity,
  MONTH2_MARKET_READINESS_INTEGRITY_ERA29_POLICY_ID,
} from "@/lib/commercial/month2-market-readiness-integrity-era29";

export { evaluateMonth2MarketReadinessIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateMonth2MarketReadinessIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nMonth 2 market readiness integrity (${MONTH2_MARKET_READINESS_INTEGRITY_ERA29_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(`Month 2 started: ${result.month2ExecutionStarted ? "yes" : "no"}`);
  console.log(`Week 1 honest: ${result.week1Complete ? "yes" : "no"}`);
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

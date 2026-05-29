#!/usr/bin/env npx tsx
/**
 * Validates month 2 market readiness convergence era25 integrity — never attest without honest week 1.
 */
import {
  evaluateMonth2MarketReadinessConvergenceIntegrity,
  MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_ERA49_POLICY_ID,
} from "@/lib/commercial/month2-market-readiness-convergence-integrity-era49";

export { evaluateMonth2MarketReadinessConvergenceIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateMonth2MarketReadinessConvergenceIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nMonth 2 market readiness convergence integrity (${MONTH2_MARKET_READINESS_CONVERGENCE_INTEGRITY_ERA49_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(
    `Month 2 convergence started: ${result.month2MarketReadinessConvergenceExecutionStarted ? "yes" : "no"}`,
  );
  console.log(
    `Month 2 convergence ready honest: ${result.month2MarketReadinessConvergenceComplete ? "yes" : "no"}`,
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

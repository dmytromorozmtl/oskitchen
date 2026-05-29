#!/usr/bin/env npx tsx
/**
 * Validates era25 engineering gates integrity — never open gates without honest first charter slice.
 */
import {
  evaluateEra25EngineeringGatesIntegrity,
  ERA25_ENGINEERING_GATES_INTEGRITY_ERA44_POLICY_ID,
} from "@/lib/commercial/era25-engineering-gates-integrity-era44";

export { evaluateEra25EngineeringGatesIntegrity };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateEra25EngineeringGatesIntegrity();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.integrityPassed ? 0 : 2);
    return;
  }

  console.log(
    `\nEra25 engineering gates integrity (${ERA25_ENGINEERING_GATES_INTEGRITY_ERA44_POLICY_ID})\n`,
  );
  console.log(`Integrity: ${result.integrityPassed ? "PASS" : "FAIL"}`);
  console.log(`Gates started: ${result.era25EngineeringGatesExecutionStarted ? "yes" : "no"}`);
  console.log(`First slice honest: ${result.era25EngineeringGatesComplete ? "yes" : "no"}`);
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

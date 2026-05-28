#!/usr/bin/env npx tsx
/**
 * Validates linear chain terminus guard — Step 17 FORBIDDEN (repo integrity).
 */
import { LINEAR_CHAIN_TERMINUS_GUARD_ERA24_POLICY_ID } from "@/lib/commercial/linear-chain-terminus-guard-era24";
import {
  LINEAR_CHAIN_FORBIDDEN_PROPOSALS,
  LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
  evaluateLinearChainTerminusGuard,
} from "@/lib/commercial/linear-chain-terminus-guard-era24";

export { evaluateLinearChainTerminusGuard };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateLinearChainTerminusGuard();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: LINEAR_CHAIN_TERMINUS_GUARD_ERA24_POLICY_ID,
          guardPassed: result.guardPassed,
          step17Forbidden: result.step17Forbidden,
          maxLinearStep: result.maxLinearStep,
          catalogStepCount: result.catalogStepCount,
          forbiddenDoc: LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
          violations: result.violations,
          forbiddenProposals: LINEAR_CHAIN_FORBIDDEN_PROPOSALS,
        },
        null,
        2,
      ),
    );
    process.exit(result.guardPassed ? 0 : 1);
  }

  console.log(`\nLinear chain terminus guard (${LINEAR_CHAIN_TERMINUS_GUARD_ERA24_POLICY_ID})\n`);

  if (result.guardPassed) {
    console.log("Guard PASS — Step 17+ forbidden · catalog locked at 16 steps.\n");
    process.exit(0);
  }

  console.log("Guard FAIL — linear chain integrity violations:\n");
  for (const violation of result.violations) {
    console.log(`  [${violation.id}] ${violation.detail}`);
  }
  console.log("");
  process.exit(1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

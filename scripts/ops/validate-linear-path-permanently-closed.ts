#!/usr/bin/env npx tsx
/**
 * Validates linear path permanently closed (Step 16, terminal — informational).
 */
import { LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_POLICY_ID } from "@/lib/commercial/linear-path-permanently-closed-era24-policy";
import {
  LINEAR_PATH_DOC_CHAIN_STEP_DOCS,
  TERMINAL_FORBIDDEN_ACTIONS,
} from "@/lib/commercial/linear-path-permanently-closed-phases-era24";
import { evaluateLinearPathPermanentlyClosed } from "@/lib/commercial/evaluate-linear-path-permanently-closed";

export { evaluateLinearPathPermanentlyClosed };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateLinearPathPermanentlyClosed();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_POLICY_ID,
          terminalClosureActive: result.terminalClosureActive,
          linearPathPermanentlyClosed: result.linearPathPermanentlyClosed,
          docChainSteps: result.docChainSteps,
          goDecision: result.goDecision,
          completedSteps: result.completedSteps,
          totalSteps: result.totalSteps,
          docChain: LINEAR_PATH_DOC_CHAIN_STEP_DOCS,
          forbiddenActions: TERMINAL_FORBIDDEN_ACTIONS,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log(
    `\nLinear path permanently closed (${LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_POLICY_ID})\n`,
  );

  if (!result.terminalClosureActive) {
    console.log("Terminal closure not active — complete Step 15 absolute end first.\n");
    console.log(`  absoluteEndActive: ${result.absoluteEnd.absoluteEndActive}`);
    console.log(`  completedSteps: ${result.completedSteps}/${result.totalSteps}\n`);
    process.exit(0);
  }

  console.log("Linear doc chain TERMINUS — Step 17+ forbidden in this chain.\n");
  console.log(`Doc chain: ${result.docChainSteps} steps`);
  console.log(`Path progress: ${result.completedSteps}/${result.totalSteps}`);
  console.log(`GO decision: ${result.goDecision ?? "missing"}\n`);

  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

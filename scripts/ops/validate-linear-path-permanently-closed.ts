#!/usr/bin/env npx tsx
/**
 * Validates linear path permanently closed (Step 16, terminal — informational).
 */
import {
  resolveLinearPathPermanentlyClosedMilestone,
  resolveMissingDocChainDocs,
  type LinearPathPermanentlyClosedMilestone,
} from "@/lib/commercial/linear-path-permanently-closed-post-absolute-end-orchestrator-era24";
import { LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_POLICY_ID } from "@/lib/commercial/linear-path-permanently-closed-era24-policy";
import {
  LINEAR_PATH_DOC_CHAIN_STEP_DOCS,
  TERMINAL_FORBIDDEN_ACTIONS,
} from "@/lib/commercial/linear-path-permanently-closed-phases-era24";
import { evaluateLinearChainTerminusGuard } from "@/lib/commercial/linear-chain-terminus-guard-era24";
import { evaluateLinearPathPermanentlyClosed } from "@/lib/commercial/evaluate-linear-path-permanently-closed";
import { evaluateCommercialPilotPathAbsoluteEndWithMilestones } from "@/scripts/ops/validate-commercial-pilot-path-absolute-end";

export { evaluateLinearPathPermanentlyClosed };

export function evaluateLinearPathPermanentlyClosedWithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  evaluation: ReturnType<typeof evaluateLinearPathPermanentlyClosed>;
  absoluteEnd: ReturnType<typeof evaluateCommercialPilotPathAbsoluteEndWithMilestones>;
  guard: ReturnType<typeof evaluateLinearChainTerminusGuard>;
  linearPathPermanentlyClosedMilestone: LinearPathPermanentlyClosedMilestone;
  missingDocChainDocs: readonly string[];
  readyForAbsoluteEndSmokes: boolean;
  readyForDocChainSmokes: boolean;
} {
  const evaluation = evaluateLinearPathPermanentlyClosed(env);
  const absoluteEnd = evaluateCommercialPilotPathAbsoluteEndWithMilestones(env);
  const guard = evaluateLinearChainTerminusGuard();
  const missingDocChainDocs = resolveMissingDocChainDocs();
  const linearPathPermanentlyClosedMilestone = resolveLinearPathPermanentlyClosedMilestone({
    terminalClosureActive: evaluation.terminalClosureActive,
    absoluteEndMilestone: absoluteEnd.absoluteEndMilestone,
    missingDocChainDocs,
    terminusGuardPassed: guard.guardPassed,
  });

  const readyForAbsoluteEndSmokes =
    !evaluation.terminalClosureActive ||
    absoluteEnd.absoluteEndMilestone !== "absolute_end_healthy";
  const readyForDocChainSmokes = missingDocChainDocs.length > 0;

  return {
    evaluation,
    absoluteEnd,
    guard,
    linearPathPermanentlyClosedMilestone,
    missingDocChainDocs,
    readyForAbsoluteEndSmokes,
    readyForDocChainSmokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateLinearPathPermanentlyClosedWithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_POLICY_ID,
          terminalClosureActive: result.evaluation.terminalClosureActive,
          linearPathPermanentlyClosed: result.evaluation.linearPathPermanentlyClosed,
          docChainSteps: result.evaluation.docChainSteps,
          goDecision: result.evaluation.goDecision,
          completedSteps: result.evaluation.completedSteps,
          totalSteps: result.evaluation.totalSteps,
          linearPathPermanentlyClosedMilestone: result.linearPathPermanentlyClosedMilestone,
          absoluteEndMilestone: result.absoluteEnd.absoluteEndMilestone,
          readyForAbsoluteEndSmokes: result.readyForAbsoluteEndSmokes,
          readyForDocChainSmokes: result.readyForDocChainSmokes,
          missingDocChainDocs: result.missingDocChainDocs,
          terminusGuardPassed: result.guard.guardPassed,
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

  if (!result.evaluation.terminalClosureActive) {
    console.log("Terminal closure not active — complete Step 15 absolute end first.\n");
    console.log(`  absoluteEndActive: ${result.evaluation.absoluteEnd.absoluteEndActive}`);
    console.log(`  completedSteps: ${result.evaluation.completedSteps}/${result.evaluation.totalSteps}\n`);
    process.exit(0);
  }

  console.log(`Linear path milestone: ${result.linearPathPermanentlyClosedMilestone}\n`);
  console.log("Linear doc chain TERMINUS — Step 17+ forbidden in this chain.\n");
  console.log(`Doc chain: ${result.evaluation.docChainSteps} steps`);
  console.log(`Missing docs: ${result.missingDocChainDocs.length}`);
  console.log(`Terminus guard: ${result.guard.guardPassed ? "PASS" : "FAIL"}`);
  console.log(`Path progress: ${result.evaluation.completedSteps}/${result.evaluation.totalSteps}`);
  console.log(`GO decision: ${result.evaluation.goDecision ?? "missing"}\n`);

  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

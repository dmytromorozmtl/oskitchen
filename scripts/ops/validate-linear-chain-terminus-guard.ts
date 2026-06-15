#!/usr/bin/env npx tsx
/**
 * Validates linear chain terminus guard — Step 17 FORBIDDEN (repo integrity).
 */
import {
  resolveLinearChainTerminusGuardMilestone,
  type LinearChainTerminusGuardMilestone,
} from "@/lib/commercial/linear-chain-terminus-guard-post-linear-path-closed-orchestrator-era24";
import { LINEAR_CHAIN_TERMINUS_GUARD_ERA24_POLICY_ID } from "@/lib/commercial/linear-chain-terminus-guard-era24-policy";
import {
  LINEAR_CHAIN_FORBIDDEN_PROPOSALS,
  LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
  evaluateLinearChainTerminusGuard,
} from "@/lib/commercial/linear-chain-terminus-guard-era24";
import { evaluateLinearPathPermanentlyClosedWithMilestones } from "@/scripts/ops/validate-linear-path-permanently-closed";

export { evaluateLinearChainTerminusGuard };

export function evaluateLinearChainTerminusGuardWithMilestones(
  env: NodeJS.ProcessEnv = process.env,
): {
  guard: ReturnType<typeof evaluateLinearChainTerminusGuard>;
  linearPath: ReturnType<typeof evaluateLinearPathPermanentlyClosedWithMilestones>;
  linearChainTerminusGuardMilestone: LinearChainTerminusGuardMilestone;
  linearPathPermanentlyClosedMilestone: ReturnType<
    typeof evaluateLinearPathPermanentlyClosedWithMilestones
  >["linearPathPermanentlyClosedMilestone"];
  readyForLinearPathClosureSmokes: boolean;
  readyForCatalogIntegritySmokes: boolean;
} {
  const guard = evaluateLinearChainTerminusGuard();
  const linearPath = evaluateLinearPathPermanentlyClosedWithMilestones(env);
  const linearChainTerminusGuardMilestone = resolveLinearChainTerminusGuardMilestone({
    linearPathPermanentlyClosedMilestone: linearPath.linearPathPermanentlyClosedMilestone,
    guardPassed: guard.guardPassed,
  });

  const readyForLinearPathClosureSmokes =
    linearPath.linearPathPermanentlyClosedMilestone !== "linear_path_permanently_closed_healthy";
  const readyForCatalogIntegritySmokes = !guard.guardPassed;

  return {
    guard,
    linearPath,
    linearChainTerminusGuardMilestone,
    linearPathPermanentlyClosedMilestone: linearPath.linearPathPermanentlyClosedMilestone,
    readyForLinearPathClosureSmokes,
    readyForCatalogIntegritySmokes,
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateLinearChainTerminusGuardWithMilestones();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: LINEAR_CHAIN_TERMINUS_GUARD_ERA24_POLICY_ID,
          guardPassed: result.guard.guardPassed,
          step17Forbidden: true,
          maxLinearStep: result.guard.maxLinearStep,
          catalogStepCount: result.guard.catalogStepCount,
          linearChainTerminusGuardMilestone: result.linearChainTerminusGuardMilestone,
          linearPathPermanentlyClosedMilestone: result.linearPathPermanentlyClosedMilestone,
          readyForLinearPathClosureSmokes: result.readyForLinearPathClosureSmokes,
          readyForCatalogIntegritySmokes: result.readyForCatalogIntegritySmokes,
          forbiddenDoc: LINEAR_CHAIN_STEP17_FORBIDDEN_DOC,
          violations: result.guard.violations,
          forbiddenProposals: LINEAR_CHAIN_FORBIDDEN_PROPOSALS,
        },
        null,
        2,
      ),
    );
    process.exit(result.guard.guardPassed ? 0 : 1);
  }

  console.log(`\nLinear chain terminus guard (${LINEAR_CHAIN_TERMINUS_GUARD_ERA24_POLICY_ID})\n`);
  console.log(`Guard milestone: ${result.linearChainTerminusGuardMilestone}`);
  console.log(`Linear path milestone: ${result.linearPathPermanentlyClosedMilestone}\n`);

  if (result.guard.guardPassed) {
    console.log("Guard PASS — Step 17+ forbidden · catalog locked at 16 steps.\n");
    process.exit(0);
  }

  console.log("Guard FAIL — linear chain integrity violations:\n");
  for (const violation of result.guard.violations) {
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

#!/usr/bin/env npx tsx
/**
 * Post-linear-path-closed terminus guard orchestrator — sync guard report.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildLinearChainTerminusGuardPostLinearPathClosedOrchestratorSummary,
  LINEAR_CHAIN_TERMINUS_GUARD_BLOCKED_MILESTONES,
  LINEAR_CHAIN_TERMINUS_GUARD_POST_LINEAR_PATH_CLOSED_ORCHESTRATOR_ERA24_POLICY_ID,
} from "@/lib/commercial/linear-chain-terminus-guard-post-linear-path-closed-orchestrator-era24";
import { LINEAR_CHAIN_TERMINUS_GUARD_REPORT_PATH } from "@/lib/commercial/linear-chain-terminus-guard-era24";
import { evaluateLinearChainTerminusGuard } from "@/lib/commercial/linear-chain-terminus-guard-era24";
import { evaluateLinearPathPermanentlyClosedWithMilestones } from "@/scripts/ops/validate-linear-path-permanently-closed";

export function runLinearChainTerminusGuardPostLinearPathClosedOrchestrator(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildLinearChainTerminusGuardPostLinearPathClosedOrchestratorSummary> {
  const guard = evaluateLinearChainTerminusGuard();
  const linearPath = evaluateLinearPathPermanentlyClosedWithMilestones();

  if (options.writeArtifacts) {
    execSync("npm run ops:sync-linear-chain-terminus-guard-report -- --write", {
      stdio: "inherit",
    });
    if (linearPath.evaluation.terminalClosureActive) {
      execSync("npm run ops:sync-linear-path-permanently-closed-report -- --write", {
        stdio: "inherit",
      });
    }
  }

  return buildLinearChainTerminusGuardPostLinearPathClosedOrchestratorSummary({
    guard,
    linearPathPermanentlyClosedMilestone: linearPath.linearPathPermanentlyClosedMilestone,
    artifacts: {
      terminusGuardReportPresent: existsSync(
        join(process.cwd(), LINEAR_CHAIN_TERMINUS_GUARD_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runLinearChainTerminusGuardPostLinearPathClosedOrchestrator({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(
      LINEAR_CHAIN_TERMINUS_GUARD_BLOCKED_MILESTONES.includes(summary.milestone) ? 2 : 0,
    );
    return;
  }

  console.log(
    `\nLinear chain terminus guard post-linear-path-closed orchestrator (${LINEAR_CHAIN_TERMINUS_GUARD_POST_LINEAR_PATH_CLOSED_ORCHESTRATOR_ERA24_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`Guard passed: ${summary.guardPassed ? "yes" : "no"}`);
  console.log(`Linear path milestone: ${summary.linearPathPermanentlyClosedMilestone}`);
  console.log(`Catalog: ${summary.catalogStepCount} steps (max ${summary.maxLinearStep})`);
  console.log(`Violations: ${summary.violationCount}`);
  if (summary.firstViolationDetail) {
    console.log(`First violation: ${summary.firstViolationDetail}`);
  }
  console.log("\nRecommended:");
  for (const command of summary.recommendedCommands) {
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

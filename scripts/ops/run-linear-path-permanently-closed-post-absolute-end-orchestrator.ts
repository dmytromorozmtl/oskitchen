#!/usr/bin/env npx tsx
/**
 * Post-absolute-end linear path permanently closed orchestrator — sync terminal closure report.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildLinearPathPermanentlyClosedPostAbsoluteEndOrchestratorSummary,
  LINEAR_PATH_PERMANENTLY_CLOSED_BLOCKED_MILESTONES,
  LINEAR_PATH_PERMANENTLY_CLOSED_POST_ABSOLUTE_END_ORCHESTRATOR_ERA24_POLICY_ID,
  resolveMissingDocChainDocs,
} from "@/lib/commercial/linear-path-permanently-closed-post-absolute-end-orchestrator-era24";
import { LINEAR_PATH_PERMANENTLY_CLOSED_REPORT_PATH } from "@/lib/commercial/linear-path-permanently-closed-phases-era24";
import { evaluateLinearChainTerminusGuard } from "@/lib/commercial/linear-chain-terminus-guard-era24";
import { evaluateLinearPathPermanentlyClosed } from "@/lib/commercial/evaluate-linear-path-permanently-closed";
import { evaluateCommercialPilotPathAbsoluteEndWithMilestones } from "@/scripts/ops/validate-commercial-pilot-path-absolute-end";

export function runLinearPathPermanentlyClosedPostAbsoluteEndOrchestrator(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildLinearPathPermanentlyClosedPostAbsoluteEndOrchestratorSummary> {
  const evaluation = evaluateLinearPathPermanentlyClosed();
  const absoluteEnd = evaluateCommercialPilotPathAbsoluteEndWithMilestones();
  const guard = evaluateLinearChainTerminusGuard();
  const missingDocChainDocs = resolveMissingDocChainDocs();

  if (options.writeArtifacts && evaluation.terminalClosureActive) {
    execSync("npm run ops:sync-linear-path-permanently-closed-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:sync-commercial-pilot-path-absolute-end-report -- --write", {
      stdio: "inherit",
    });
  }

  return buildLinearPathPermanentlyClosedPostAbsoluteEndOrchestratorSummary({
    evaluation,
    absoluteEndMilestone: absoluteEnd.absoluteEndMilestone,
    missingDocChainDocs,
    terminusGuardPassed: guard.guardPassed,
    terminusGuardViolationCount: guard.violations.length,
    artifacts: {
      linearPathReportPresent: existsSync(
        join(process.cwd(), LINEAR_PATH_PERMANENTLY_CLOSED_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runLinearPathPermanentlyClosedPostAbsoluteEndOrchestrator({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(
      LINEAR_PATH_PERMANENTLY_CLOSED_BLOCKED_MILESTONES.includes(summary.milestone) ? 2 : 0,
    );
    return;
  }

  console.log(
    `\nLinear path permanently closed post-absolute-end orchestrator (${LINEAR_PATH_PERMANENTLY_CLOSED_POST_ABSOLUTE_END_ORCHESTRATOR_ERA24_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`Terminal closure active: ${summary.terminalClosureActive ? "yes" : "no"}`);
  console.log(`Absolute end milestone: ${summary.absoluteEndMilestone}`);
  console.log(`Doc chain: ${summary.docChainSteps} steps (${summary.missingDocChainDocs.length} missing)`);
  console.log(
    `Terminus guard: ${summary.terminusGuardPassed ? "PASS" : "FAIL"} (${summary.terminusGuardViolationCount} violations)`,
  );
  console.log(`Progress: ${summary.completedSteps}/${summary.totalSteps} steps`);
  console.log(`GO decision: ${summary.goDecision ?? "missing"}`);
  if (summary.missingDocChainDocs.length > 0) {
    console.log(`Missing docs: ${summary.missingDocChainDocs.join(", ")}`);
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

#!/usr/bin/env npx tsx
/**
 * Commercial inflection readiness orchestrator — sync report + honest milestone JSON.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildCommercialInflectionReadinessOrchestratorSummary,
  COMMERCIAL_INFLECTION_READINESS_POST_LINEAR_CLOSURE_ORCHESTRATOR_POLICY_ID,
} from "@/lib/commercial/commercial-inflection-readiness-post-linear-closure-orchestrator-era28";
import {
  COMMERCIAL_INFLECTION_BLOCKED_MILESTONES,
  COMMERCIAL_INFLECTION_READINESS_REPORT_PATH,
  evaluateCommercialInflectionReadiness,
} from "@/lib/commercial/commercial-inflection-readiness-era28";

export function runCommercialInflectionReadinessOrchestrator(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildCommercialInflectionReadinessOrchestratorSummary> {
  const evaluation = evaluateCommercialInflectionReadiness();

  if (options.writeArtifacts) {
    execSync("npm run ops:sync-commercial-inflection-readiness-report -- --write", {
      stdio: "inherit",
    });
  }

  return buildCommercialInflectionReadinessOrchestratorSummary({
    evaluation,
    artifacts: {
      inflectionReportPresent: existsSync(
        join(process.cwd(), COMMERCIAL_INFLECTION_READINESS_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runCommercialInflectionReadinessOrchestrator({ writeArtifacts: write });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(
      COMMERCIAL_INFLECTION_BLOCKED_MILESTONES.includes(summary.milestone) ? 2 : 0,
    );
    return;
  }

  console.log(
    `\nCommercial inflection readiness orchestrator (${COMMERCIAL_INFLECTION_READINESS_POST_LINEAR_CLOSURE_ORCHESTRATOR_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(
    `Scores: pilot ${summary.pilotExecutableScore}/100 · governance ${summary.governanceScore}/100`,
  );
  console.log(`P0 vault missing: ${summary.p0VaultMissingCount}/11 · P0 proof: ${summary.p0ProofStatus}`);
  console.log(`GO: ${summary.goDecision ?? "missing"}`);
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

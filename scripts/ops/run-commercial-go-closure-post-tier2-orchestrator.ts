#!/usr/bin/env npx tsx
/**
 * Post-Tier2 commercial GO orchestrator — validate gates, sync reports, export readiness.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildCommercialGoClosurePostTier2OrchestratorSummary,
  COMMERCIAL_GO_CLOSURE_POST_TIER2_ORCHESTRATOR_ERA21_POLICY_ID,
} from "@/lib/commercial/commercial-go-closure-post-tier2-orchestrator-era21";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/commercial-go-closure-phases-era21";
import { evaluateCommercialGoClosureEnv } from "@/scripts/ops/validate-commercial-go-closure-env";

export function runCommercialGoClosurePostTier2Orchestrator(options: {
  writeArtifacts?: boolean;
  skipTemplate?: boolean;
} = {}): ReturnType<typeof buildCommercialGoClosurePostTier2OrchestratorSummary> {
  if (!options.skipTemplate && evaluateCommercialGoClosureEnv().prerequisites.prerequisitesComplete) {
    execSync("npm run ops:export-commercial-go-closure-env-template -- --write", {
      stdio: "inherit",
    });
  }

  const evaluation = evaluateCommercialGoClosureEnv();
  const goNoGoArtifactPresent = existsSync(
    join(process.cwd(), PILOT_GONOGO_SUMMARY_ARTIFACT_PATH),
  );

  if (options.writeArtifacts && evaluation.prerequisites.prerequisitesComplete) {
    execSync("npm run ops:sync-commercial-go-closure-progress-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:export-commercial-go-closure-readiness-checklist -- --write", {
      stdio: "inherit",
    });
  }

  return buildCommercialGoClosurePostTier2OrchestratorSummary({
    evaluation,
    goNoGoArtifactPresent,
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");
  const skipTemplate = process.argv.includes("--skip-template");

  const summary = runCommercialGoClosurePostTier2Orchestrator({
    writeArtifacts: write,
    skipTemplate,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "tier2_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nCommercial GO closure post-Tier2 orchestrator (${COMMERCIAL_GO_CLOSURE_POST_TIER2_ORCHESTRATOR_ERA21_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(
    `Prerequisites: P0=${summary.p0ProofStatus ?? "missing"} · Tier2=${summary.tier2ProofStatus ?? "missing"}`,
  );
  console.log(`Decision: ${summary.decision ?? "not evaluated"}`);
  console.log(`Ready for smoke:pilot-gono-go: ${summary.readyForGoOrchestrator ? "yes" : "no"}`);
  if (summary.nextPhaseLabel) {
    console.log(`Next phase: ${summary.nextPhaseLabel}`);
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

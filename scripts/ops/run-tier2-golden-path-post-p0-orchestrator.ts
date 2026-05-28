#!/usr/bin/env npx tsx
/**
 * Post-P0 Tier 2 orchestrator — validate gates, sync reports, export readiness checklist.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildTier2GoldenPathPostP0OrchestratorSummary,
  TIER2_GOLDEN_PATH_POST_P0_ORCHESTRATOR_ERA21_POLICY_ID,
} from "@/lib/commercial/tier2-golden-path-post-p0-orchestrator-era21";
import { TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import { evaluateTier2GoldenPathEnv } from "@/scripts/ops/validate-tier2-golden-path-env";

export function runTier2GoldenPathPostP0Orchestrator(options: {
  writeArtifacts?: boolean;
  skipTemplate?: boolean;
} = {}): ReturnType<typeof buildTier2GoldenPathPostP0OrchestratorSummary> {
  if (!options.skipTemplate) {
    execSync("npm run ops:export-tier2-golden-path-env-template -- --write", {
      stdio: "inherit",
    });
  }

  const evaluation = evaluateTier2GoldenPathEnv();
  const artifactPresent = existsSync(
    join(process.cwd(), TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT),
  );

  if (options.writeArtifacts && evaluation.p0GatePassed) {
    execSync("npm run ops:sync-tier2-golden-path-progress-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:export-tier2-golden-path-readiness-checklist -- --write", {
      stdio: "inherit",
    });
  }

  return buildTier2GoldenPathPostP0OrchestratorSummary({ evaluation, artifactPresent });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");
  const skipTemplate = process.argv.includes("--skip-template");

  const summary = runTier2GoldenPathPostP0Orchestrator({
    writeArtifacts: write,
    skipTemplate,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "p0_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nTier 2 golden path post-P0 orchestrator (${TIER2_GOLDEN_PATH_POST_P0_ORCHESTRATOR_ERA21_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`P0: ${summary.p0ProofStatus ?? "missing"} (${summary.p0GatePassed ? "PASS" : "BLOCKED"})`);
  console.log(`Tier 2: ${summary.tier2ProofStatus ?? "missing"}`);
  console.log(`Env: ${summary.envPresentCount}/${summary.envTotalCount} tracked vars in shell`);
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

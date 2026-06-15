#!/usr/bin/env npx tsx
/**
 * Day 0 orchestrator — template export, env validate, staging health, progress + checklist sync.
 */
import { execSync } from "node:child_process";

import {
  buildP0VaultDay0OrchestratorSummary,
  loadP0StagingProofArtifact,
  P0_OPS_VAULT_DAY0_ORCHESTRATOR_ERA21_POLICY_ID,
  checkP0StagingHealth,
} from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";
import { evaluateP0VaultEnv } from "@/scripts/ops/validate-p0-vault-env";

export async function runP0VaultDay0Orchestrator(options: {
  writeArtifacts?: boolean;
  skipHealth?: boolean;
  skipTemplate?: boolean;
} = {}): Promise<ReturnType<typeof buildP0VaultDay0OrchestratorSummary>> {
  if (!options.skipTemplate) {
    execSync("npm run ops:export-p0-vault-env-template -- --write", {
      stdio: "inherit",
    });
  }

  const env = evaluateP0VaultEnv();
  const artifact = loadP0StagingProofArtifact();
  const stagingHealth = options.skipHealth
    ? {
        checked: false,
        ok: false,
        url: null,
        statusCode: null,
        error: "skipped",
      }
    : await checkP0StagingHealth(process.env.E2E_STAGING_BASE_URL);

  if (options.writeArtifacts) {
    execSync("npm run ops:sync-p0-vault-progress-report -- --write", { stdio: "inherit" });
    execSync("npm run ops:export-p0-vault-day0-readiness-checklist -- --write", {
      stdio: "inherit",
    });
    execSync("npm run check-vault-readiness -- --write", { stdio: "inherit" });
  }

  return buildP0VaultDay0OrchestratorSummary({ env, artifact, stagingHealth });
}

async function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");
  const skipHealth = process.argv.includes("--skip-health");
  const skipTemplate = process.argv.includes("--skip-template");

  const summary = await runP0VaultDay0Orchestrator({
    writeArtifacts: write,
    skipHealth,
    skipTemplate,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "proof_passed" ? 0 : summary.day0PartialComplete ? 0 : 1);
  }

  console.log(`\nP0 ops vault Day 0 orchestrator (${P0_OPS_VAULT_DAY0_ORCHESTRATOR_ERA21_POLICY_ID})\n`);
  console.log(`Milestone: ${summary.milestone}`);
  console.log(
    `Env: ${summary.envPresentCount}/${summary.envTotalCount} · Day 0 partial (Phase 1+2): ${
      summary.day0PartialComplete ? "yes" : "no"
    }`,
  );
  console.log(`Artifact: ${summary.artifactPresent ? summary.p0ProofStatus : "missing"}`);
  if (summary.nextPhaseLabel) {
    console.log(`Next phase: ${summary.nextPhaseLabel}`);
  }
  if (summary.stagingHealth.checked) {
    console.log(
      `Staging health: ${summary.stagingHealth.ok ? "PASS" : "FAIL"} — ${
        summary.stagingHealth.url ?? "n/a"
      }`,
    );
  } else if (!skipHealth) {
    console.log("Staging health: SKIPPED — set E2E_STAGING_BASE_URL");
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
  void main();
}

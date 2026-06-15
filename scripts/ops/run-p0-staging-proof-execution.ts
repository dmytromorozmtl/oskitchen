#!/usr/bin/env npx tsx
/**
 * Step 2 — P0 staging proof execution orchestrator.
 * Policy: era30-p0-staging-proof-execution-v1
 *
 * Default: assess phases + write honest execution report (no smoke runs).
 * --execute: run next incomplete smoke when vault is ready (PASS > SKIPPED).
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { evaluateP0StagingProofIntegrity } from "@/lib/commercial/p0-staging-proof-integrity-era28";
import { loadP0StagingProofArtifact } from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import { checkP0StagingHealth } from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";
import { renderP0StagingProofExecutionHtml } from "@/lib/ops/p0-staging-proof-execution-html";
import {
  buildP0StagingProofExecutionSummary,
  formatP0StagingProofExecutionLines,
  P0_STAGING_PROOF_EXECUTION_HTML_ARTIFACT,
  P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_POLICY_ID,
  P0_STAGING_PROOF_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/p0-staging-proof-execution-orchestrator";
import { runVaultReadinessCheck } from "@/scripts/check-vault-readiness";
import { loadStagingPilotEnv } from "@/scripts/lib/load-dotenv-file";

type LooseArtifact = Record<string, unknown>;

function loadJson<T>(relativePath: string): T | null {
  const path = join(process.cwd(), relativePath);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function runNpmScript(script: string): void {
  execSync(`npm run ${script}`, { stdio: "inherit", env: process.env });
}

async function collectExecutionContext() {
  const vaultReport = runVaultReadinessCheck({ writeHtml: false });
  const stagingHealth = await checkP0StagingHealth(process.env.E2E_STAGING_BASE_URL);
  const integrity = evaluateP0StagingProofIntegrity();
  const p0 =
    loadJson<P0StagingProofUnblockSummary>("artifacts/p0-staging-proof-unblock-summary.json") ??
    (loadP0StagingProofArtifact() as P0StagingProofUnblockSummary | null);

  return buildP0StagingProofExecutionSummary({
    vaultReport,
    stagingHealth,
    integrityPassed: integrity.integrityPassed,
    childArtifacts: {
      workflows: loadJson<LooseArtifact>("artifacts/staging-workflows-first-green-summary.json"),
      channel: loadJson<LooseArtifact>("artifacts/channel-live-smoke-summary.json"),
      sso: loadJson<LooseArtifact>("artifacts/enterprise-sso-idp-staging-smoke-summary.json"),
      p0,
    },
  });
}

function writeExecutionArtifacts(summary: ReturnType<typeof buildP0StagingProofExecutionSummary>): void {
  const jsonPath = join(process.cwd(), P0_STAGING_PROOF_EXECUTION_SUMMARY_ARTIFACT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const htmlPath = join(process.cwd(), P0_STAGING_PROOF_EXECUTION_HTML_ARTIFACT);
  writeFileSync(htmlPath, renderP0StagingProofExecutionHtml(summary), "utf8");
}

async function maybeExecuteNextSmoke(
  summary: ReturnType<typeof buildP0StagingProofExecutionSummary>,
): Promise<void> {
  if (!summary.vaultReady) {
    console.log("\nVault not ready — skipping --execute (configure 11 secrets first).\n");
    return;
  }

  const next = summary.nextPhase;
  if (!next) return;

  if (next.id === "staging_health") {
    console.log("\n→ npm run ops:check-p0-staging-health\n");
    execSync("npm run ops:check-p0-staging-health", { stdio: "inherit", env: process.env });
    return;
  }

  if (next.id === "integrity_validate") {
    console.log("\n→ npm run ops:validate-p0-staging-proof-integrity\n");
    execSync("npm run ops:validate-p0-staging-proof-integrity", { stdio: "inherit", env: process.env });
    return;
  }

  if (next.smokeScript) {
    console.log(`\n→ npm run ${next.smokeScript}\n`);
    runNpmScript(next.smokeScript);
  }
}

export async function runP0StagingProofExecution(options?: {
  execute?: boolean;
  writeArtifacts?: boolean;
}): Promise<ReturnType<typeof buildP0StagingProofExecutionSummary>> {
  loadStagingPilotEnv();
  let summary = await collectExecutionContext();

  if (options?.execute) {
    await maybeExecuteNextSmoke(summary);
    summary = await collectExecutionContext();
    execSync("npm run check-vault-readiness -- --write", { stdio: "inherit", env: process.env });
  }

  if (options?.writeArtifacts !== false) {
    writeExecutionArtifacts(summary);
  }

  return summary;
}

async function main() {
  loadStagingPilotEnv();
  const jsonOnly = process.argv.includes("--json");
  const execute = process.argv.includes("--execute");

  const summary = await runP0StagingProofExecution({ execute, writeArtifacts: true });

  if (jsonOnly) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "proof_passed" ? 0 : 1);
    return;
  }

  console.log(`\nP0 staging proof execution (${P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_POLICY_ID})\n`);
  for (const line of formatP0StagingProofExecutionLines(summary)) {
    console.log(line);
  }
  console.log(`\nJSON: ${P0_STAGING_PROOF_EXECUTION_SUMMARY_ARTIFACT}`);
  console.log(`HTML: ${P0_STAGING_PROOF_EXECUTION_HTML_ARTIFACT}`);
  console.log("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    console.log(`  ${command}`);
  }
  console.log(`\n${summary.honestyNote}\n`);

  process.exit(summary.milestone === "proof_passed" ? 0 : 1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  void main();
}

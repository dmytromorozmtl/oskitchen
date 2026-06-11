#!/usr/bin/env npx tsx
/**
 * Step 3 — Tier 2 staging proof execution orchestrator.
 * Policy: era31-tier2-staging-proof-execution-v1
 *
 * Default: assess phases + write honest execution report (no smoke runs).
 * --execute: run next incomplete smoke when P0 gate passed (PASS > SKIPPED).
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { renderTier2StagingProofExecutionHtml } from "@/lib/ops/tier2-staging-proof-execution-html";
import {
  buildTier2StagingProofExecutionSummary,
  formatTier2StagingProofExecutionLines,
  TIER2_STAGING_PROOF_EXECUTION_HTML_ARTIFACT,
  TIER2_STAGING_PROOF_EXECUTION_POLICY_ID,
  TIER2_STAGING_PROOF_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/tier2-staging-proof-execution-orchestrator";
import type { P0StagingProofExecutionSummary } from "@/lib/ops/p0-staging-proof-execution-orchestrator";
import { logger } from "@/lib/logger";

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

function collectExecutionContext() {
  return buildTier2StagingProofExecutionSummary({
    tier2Summary: loadJson<Tier2StagingGoldenPathSummary>(
      "artifacts/tier2-staging-golden-path-summary.json",
    ),
    p0Execution: loadJson<P0StagingProofExecutionSummary>(
      "artifacts/p0-staging-proof-execution-summary.json",
    ),
    kdsArtifact: loadJson<LooseArtifact>("artifacts/kds-staging-playwright-proof-summary.json"),
    goNoGo: loadJson<LooseArtifact>("artifacts/pilot-gono-go-summary.json"),
  });
}

function writeExecutionArtifacts(
  summary: ReturnType<typeof buildTier2StagingProofExecutionSummary>,
): void {
  const jsonPath = join(process.cwd(), TIER2_STAGING_PROOF_EXECUTION_SUMMARY_ARTIFACT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const htmlPath = join(process.cwd(), TIER2_STAGING_PROOF_EXECUTION_HTML_ARTIFACT);
  writeFileSync(htmlPath, renderTier2StagingProofExecutionHtml(summary), "utf8");
}

function maybeExecuteNextSmoke(
  summary: ReturnType<typeof buildTier2StagingProofExecutionSummary>,
): void {
  if (summary.milestone === "p0_blocked") {
    logger.cli("\nP0 not passed — skipping --execute (complete Step 2 first).\n");
    return;
  }

  if (summary.milestone === "p0_execution_blocked") {
    logger.cli("\nP0 execution incomplete — run ops:run-p0-staging-proof-execution --execute first.\n");
    return;
  }

  const next = summary.nextPhase;
  if (!next) {
    if (summary.milestone === "awaiting_tier2_integrity") {
      logger.cli("\n→ npm run ops:validate-tier2-staging-golden-path-integrity\n");
      execSync("npm run ops:validate-tier2-staging-golden-path-integrity", {
        stdio: "inherit",
        env: process.env,
      });
    }
    return;
  }

  if (next.id === "automated_child_smokes") {
    logger.cli("\n→ npm run smoke:tier2-staging-golden-path\n");
    runNpmScript("smoke:tier2-staging-golden-path");
    return;
  }

  if (next.smokeScripts.includes("playwright-kds-staging")) {
    logger.cli("\n→ npm run smoke:kds-staging-playwright\n");
    runNpmScript("smoke:kds-staging-playwright");
    return;
  }

  if (next.smokeScripts.length > 0) {
    logger.cli(`\n→ npm run ${next.smokeScripts[0]}\n`);
    runNpmScript(next.smokeScripts[0]!);
    return;
  }

  logger.cli(
    `\nNext phase requires manual staging sign-off: ${next.label}\n${next.detail}\n`,
  );
}

export function runTier2StagingProofExecution(options?: {
  execute?: boolean;
  writeArtifacts?: boolean;
}): ReturnType<typeof buildTier2StagingProofExecutionSummary> {
  let summary = collectExecutionContext();

  if (options?.execute) {
    maybeExecuteNextSmoke(summary);
    summary = collectExecutionContext();
    execSync("npm run ops:run-tier2-golden-path-post-p0-orchestrator -- --write", {
      stdio: "inherit",
      env: process.env,
    });
    summary = collectExecutionContext();
  }

  if (options?.writeArtifacts !== false) {
    writeExecutionArtifacts(summary);
  }

  return summary;
}

function main() {
  const jsonOnly = process.argv.includes("--json");
  const execute = process.argv.includes("--execute");

  const summary = runTier2StagingProofExecution({ execute, writeArtifacts: true });

  if (jsonOnly) {
    logger.cli(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "proof_passed" ? 0 : 1);
    return;
  }

  logger.cli(`\nTier 2 staging proof execution (${TIER2_STAGING_PROOF_EXECUTION_POLICY_ID})\n`);
  for (const line of formatTier2StagingProofExecutionLines(summary)) {
    logger.cli(line);
  }
  logger.cli(`\nJSON: ${TIER2_STAGING_PROOF_EXECUTION_SUMMARY_ARTIFACT}`);
  logger.cli(`HTML: ${TIER2_STAGING_PROOF_EXECUTION_HTML_ARTIFACT}`);
  logger.cli("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    logger.cli(`  ${command}`);
  }
  logger.cli(`\n${summary.honestyNote}\n`);

  process.exit(summary.milestone === "proof_passed" ? 0 : 1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

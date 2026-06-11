#!/usr/bin/env npx tsx
/**
 * Step 5 — Pilot Week 1 execution orchestrator.
 * Policy: era33-pilot-week1-execution-v1
 *
 * Default: assess phases + write honest execution report (no smoke runs).
 * --execute: run next incomplete step when commercial gate passed (PASS > SKIPPED).
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { CommercialGateExecutionSummary } from "@/lib/ops/commercial-gate-execution-orchestrator";
import { renderPilotWeek1ExecutionHtml } from "@/lib/ops/pilot-week1-execution-html";
import {
  buildPilotWeek1ExecutionOrchestratorSummary,
  formatPilotWeek1ExecutionOrchestratorLines,
  PILOT_WEEK1_EXECUTION_HTML_ARTIFACT,
  PILOT_WEEK1_EXECUTION_ORCHESTRATOR_POLICY_ID,
  PILOT_WEEK1_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/pilot-week1-execution-orchestrator";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotGoldenPathSummary } from "@/lib/commercial/pilot-operator-golden-path-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";
import { logger } from "@/lib/logger";

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
  return buildPilotWeek1ExecutionOrchestratorSummary({
    commercialGate: loadJson<CommercialGateExecutionSummary>(
      "artifacts/commercial-gate-execution-summary.json",
    ),
    goNoGo: loadJson<PilotGoNoGoSummary>("artifacts/pilot-gono-go-summary.json"),
    operatorGoldenPath: loadJson<PilotGoldenPathSummary>(
      "artifacts/pilot-operator-golden-path-summary.json",
    ),
    rollbackDrill: loadJson<PilotRollbackDrillSummary>("artifacts/pilot-rollback-drill-summary.json"),
  });
}

function writeExecutionArtifacts(
  summary: ReturnType<typeof buildPilotWeek1ExecutionOrchestratorSummary>,
): void {
  const jsonPath = join(process.cwd(), PILOT_WEEK1_EXECUTION_SUMMARY_ARTIFACT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const htmlPath = join(process.cwd(), PILOT_WEEK1_EXECUTION_HTML_ARTIFACT);
  writeFileSync(htmlPath, renderPilotWeek1ExecutionHtml(summary), "utf8");
}

function maybeExecuteNextStep(
  summary: ReturnType<typeof buildPilotWeek1ExecutionOrchestratorSummary>,
): void {
  if (summary.milestone === "commercial_gate_blocked") {
    logger.cli("\nCommercial gate not passed — complete Step 4 first.\n");
    return;
  }

  if (summary.milestone === "go_blocked") {
    logger.cli("\nGO not recorded — run smoke:pilot-gono-go after commercial gate PASS.\n");
    return;
  }

  if (summary.milestone === "awaiting_checkpoint_smokes") {
    if (summary.operatorGoldenPathProofStatus !== "proof_passed") {
      logger.cli("\n→ npm run smoke:pilot-operator-golden-path\n");
      runNpmScript("smoke:pilot-operator-golden-path");
      return;
    }
    logger.cli("\n→ npm run smoke:pilot-rollback-drill\n");
    runNpmScript("smoke:pilot-rollback-drill");
    return;
  }

  if (summary.milestone === "awaiting_cs_signoff") {
    logger.cli(
      "\nCS sign-off required — set PILOT_WEEK1_CHECKPOINT_DATE and PILOT_WEEK1_OPERATOR_SATISFACTION after Day 7 review.\n",
    );
    return;
  }

  if (summary.milestone === "awaiting_week1_integrity") {
    logger.cli("\n→ npm run ops:validate-pilot-week1-execution-integrity\n");
    execSync("npm run ops:validate-pilot-week1-execution-integrity", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  const next = summary.nextPhase;
  if (!next) return;

  if (next.smokeScripts.length > 0) {
    logger.cli(`\n→ npm run ${next.smokeScripts[0]}\n`);
    runNpmScript(next.smokeScripts[0]!);
    return;
  }

  if (summary.readyForDay5Smokes && next.id === "day5_metrics_narrative") {
    logger.cli("\n→ npm run smoke:pilot-metrics-baseline\n");
    runNpmScript("smoke:pilot-metrics-baseline");
    return;
  }

  logger.cli(`\nNext phase requires human attestation: ${next.label}\n${next.detail}\n`);
}

export function runPilotWeek1Execution(options?: {
  execute?: boolean;
  writeArtifacts?: boolean;
}): ReturnType<typeof buildPilotWeek1ExecutionOrchestratorSummary> {
  let summary = collectExecutionContext();

  if (options?.execute) {
    maybeExecuteNextStep(summary);
    summary = collectExecutionContext();
    execSync("npm run ops:run-pilot-week1-execution-post-go-orchestrator -- --write", {
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

  const summary = runPilotWeek1Execution({ execute, writeArtifacts: true });

  if (jsonOnly) {
    logger.cli(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "week1_execution_passed" ? 0 : 1);
    return;
  }

  logger.cli(`\nPilot Week 1 execution (${PILOT_WEEK1_EXECUTION_ORCHESTRATOR_POLICY_ID})\n`);
  for (const line of formatPilotWeek1ExecutionOrchestratorLines(summary)) {
    logger.cli(line);
  }
  logger.cli(`\nJSON: ${PILOT_WEEK1_EXECUTION_SUMMARY_ARTIFACT}`);
  logger.cli(`HTML: ${PILOT_WEEK1_EXECUTION_HTML_ARTIFACT}`);
  logger.cli("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    logger.cli(`  ${command}`);
  }
  logger.cli(`\n${summary.honestyNote}\n`);

  process.exit(summary.milestone === "week1_execution_passed" ? 0 : 1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

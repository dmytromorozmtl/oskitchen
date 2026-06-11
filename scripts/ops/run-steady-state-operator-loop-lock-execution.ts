#!/usr/bin/env npx tsx
/**
 * Step 15 — Steady-state operator loop lock execution orchestrator.
 * Policy: era43-steady-state-operator-loop-lock-execution-v1
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { ProductionPilotReadyClosureExecutionSummary } from "@/lib/ops/production-pilot-ready-closure-execution-orchestrator";
import { renderSteadyStateOperatorLoopLockExecutionHtml } from "@/lib/ops/steady-state-operator-loop-lock-execution-html";
import {
import { logger } from "@/lib/logger";
  buildSteadyStateOperatorLoopLockExecutionSummary,
  formatSteadyStateOperatorLoopLockExecutionLines,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_HTML_ARTIFACT,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_POLICY_ID,
  STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/steady-state-operator-loop-lock-execution-orchestrator";

function loadJson<T>(relativePath: string): T | null {
  const path = join(process.cwd(), relativePath);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function collectExecutionContext() {
  return buildSteadyStateOperatorLoopLockExecutionSummary({
    productionPilotReadyClosure: loadJson<ProductionPilotReadyClosureExecutionSummary>(
      "artifacts/production-pilot-ready-closure-execution-summary.json",
    ),
    goNoGo: loadJson<PilotGoNoGoSummary>("artifacts/pilot-gono-go-summary.json"),
  });
}

function writeExecutionArtifacts(
  summary: ReturnType<typeof buildSteadyStateOperatorLoopLockExecutionSummary>,
): void {
  const jsonPath = join(process.cwd(), STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_SUMMARY_ARTIFACT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const htmlPath = join(process.cwd(), STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_HTML_ARTIFACT);
  writeFileSync(htmlPath, renderSteadyStateOperatorLoopLockExecutionHtml(summary), "utf8");
}

function maybeExecuteNextStep(
  summary: ReturnType<typeof buildSteadyStateOperatorLoopLockExecutionSummary>,
): void {
  if (summary.milestone === "production_pilot_ready_blocked") {
    logger.cli("\n→ npm run ops:run-production-pilot-ready-closure-execution -- --write\n");
    execSync("npm run ops:run-production-pilot-ready-closure-execution -- --write", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  if (
    summary.milestone === "awaiting_post_terminus_steady_state" ||
    summary.milestone === "awaiting_steady_state_track_attention"
  ) {
    logger.cli(
      "\n→ npm run ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator -- --write\n",
    );
    execSync(
      "npm run ops:run-post-terminus-steady-state-post-engineering-terminus-orchestrator -- --write",
      { stdio: "inherit", env: process.env },
    );
    return;
  }

  if (summary.milestone === "awaiting_post_terminus_steady_state_integrity") {
    logger.cli("\n→ npm run ops:validate-post-terminus-steady-state-integrity -- --json\n");
    execSync("npm run ops:validate-post-terminus-steady-state-integrity -- --json", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  if (summary.milestone === "awaiting_era_charter_checklist") {
    logger.cli("\n→ npm run ops:export-era-charter-readiness-checklist -- --write\n");
    execSync("npm run ops:export-era-charter-readiness-checklist -- --write", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  if (summary.milestone === "awaiting_era25_operator_loop_lock_integrity") {
    logger.cli(
      "\n→ npm run ops:validate-era25-steady-state-operator-loop-lock-integrity -- --json\n",
    );
    execSync(
      "npm run ops:validate-era25-steady-state-operator-loop-lock-integrity -- --json",
      { stdio: "inherit", env: process.env },
    );
    return;
  }

  if (summary.milestone === "awaiting_per_pilot_isolation") {
    logger.cli("\n→ npm run smoke:pilot-gono-go\n");
    execSync("npm run smoke:pilot-gono-go", { stdio: "inherit", env: process.env });
    return;
  }

  logger.cli("\n→ npm run ops:validate-steady-state-operator-loop -- --json\n");
  execSync("npm run ops:validate-steady-state-operator-loop -- --json", {
    stdio: "inherit",
    env: process.env,
  });
}

export function runSteadyStateOperatorLoopLockExecution(options?: {
  execute?: boolean;
  writeArtifacts?: boolean;
}): ReturnType<typeof buildSteadyStateOperatorLoopLockExecutionSummary> {
  let summary = collectExecutionContext();

  if (options?.execute) {
    maybeExecuteNextStep(summary);
    summary = collectExecutionContext();
    execSync("npm run ops:run-production-pilot-ready-closure-execution -- --write", {
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

  const summary = runSteadyStateOperatorLoopLockExecution({ execute, writeArtifacts: true });

  if (jsonOnly) {
    logger.cli(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "steady_state_operator_loop_passed" ? 0 : 1);
    return;
  }

  logger.cli(
    `\nSteady-state operator loop lock (${STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_POLICY_ID})\n`,
  );
  for (const line of formatSteadyStateOperatorLoopLockExecutionLines(summary)) {
    logger.cli(line);
  }
  logger.cli(`\nJSON: ${STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_SUMMARY_ARTIFACT}`);
  logger.cli(`HTML: ${STEADY_STATE_OPERATOR_LOOP_LOCK_EXECUTION_HTML_ARTIFACT}`);
  logger.cli("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    logger.cli(`  ${command}`);
  }
  logger.cli(`\n${summary.honestyNote}\n`);

  process.exit(summary.milestone === "steady_state_operator_loop_passed" ? 0 : 1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

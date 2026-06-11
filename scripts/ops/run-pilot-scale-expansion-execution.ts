#!/usr/bin/env npx tsx
/**
 * Step 6 — Pilot scale expansion execution orchestrator.
 * Policy: era34-pilot-scale-expansion-execution-v1
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { renderPilotScaleExpansionExecutionHtml } from "@/lib/ops/pilot-scale-expansion-execution-html";
import {
  buildPilotScaleExpansionExecutionSummary,
  formatPilotScaleExpansionExecutionLines,
  PILOT_SCALE_EXPANSION_EXECUTION_HTML_ARTIFACT,
  PILOT_SCALE_EXPANSION_EXECUTION_ORCHESTRATOR_POLICY_ID,
  PILOT_SCALE_EXPANSION_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";
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
  return buildPilotScaleExpansionExecutionSummary({
    week1Execution: loadJson<PilotWeek1ExecutionOrchestratorSummary>(
      "artifacts/pilot-week1-execution-summary.json",
    ),
    goNoGo: loadJson<PilotGoNoGoSummary>("artifacts/pilot-gono-go-summary.json"),
  });
}

function writeExecutionArtifacts(
  summary: ReturnType<typeof buildPilotScaleExpansionExecutionSummary>,
): void {
  const jsonPath = join(process.cwd(), PILOT_SCALE_EXPANSION_EXECUTION_SUMMARY_ARTIFACT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const htmlPath = join(process.cwd(), PILOT_SCALE_EXPANSION_EXECUTION_HTML_ARTIFACT);
  writeFileSync(htmlPath, renderPilotScaleExpansionExecutionHtml(summary), "utf8");
}

function maybeExecuteNextStep(
  summary: ReturnType<typeof buildPilotScaleExpansionExecutionSummary>,
): void {
  if (summary.milestone === "week1_execution_blocked") {
    logger.cli("\nWeek 1 execution not passed — complete Step 5 first.\n");
    return;
  }

  if (summary.milestone === "awaiting_scale_integrity") {
    logger.cli("\n→ npm run ops:validate-scale-readiness-integrity\n");
    execSync("npm run ops:validate-scale-readiness-integrity", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  const next = summary.nextPhase;
  if (next?.smokeScripts.length) {
    logger.cli(`\n→ npm run ${next.smokeScripts[0]}\n`);
    runNpmScript(next.smokeScripts[0]!);
    return;
  }

  if (next?.id === "expansion_loi") {
    logger.cli(
      `\nExpansion LOI required: set PILOT_SCALE_EXPANSION_LOI_SIGNED_DATE + PILOT_SCALE_EXPANSION_SCOPE after legal sign-off.\n`,
    );
    return;
  }

  if (!summary.weekPhasesComplete && next) {
    logger.cli(`\nNext phase requires attestation: ${next.label}\n${next.detail}\n`);
    return;
  }

  if (summary.weekPhasesComplete && !summary.scaleComplete) {
    const nextScale = summary.scalePhases.find((p) => !p.optional && !p.complete);
    if (nextScale?.smokeScripts.length) {
      logger.cli(`\n→ npm run ${nextScale.smokeScripts[0]}\n`);
      runNpmScript(nextScale.smokeScripts[0]!);
      return;
    }
    logger.cli("\n→ npm run ops:run-scale-readiness-post-month2-orchestrator -- --write\n");
    execSync("npm run ops:run-scale-readiness-post-month2-orchestrator -- --write", {
      stdio: "inherit",
      env: process.env,
    });
  }
}

export function runPilotScaleExpansionExecution(options?: {
  execute?: boolean;
  writeArtifacts?: boolean;
}): ReturnType<typeof buildPilotScaleExpansionExecutionSummary> {
  let summary = collectExecutionContext();

  if (options?.execute) {
    maybeExecuteNextStep(summary);
    summary = collectExecutionContext();
    execSync("npm run ops:run-scale-readiness-post-month2-orchestrator -- --write", {
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

  const summary = runPilotScaleExpansionExecution({ execute, writeArtifacts: true });

  if (jsonOnly) {
    logger.cli(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "pilot_scale_expansion_passed" ? 0 : 1);
    return;
  }

  logger.cli(`\nPilot scale expansion execution (${PILOT_SCALE_EXPANSION_EXECUTION_ORCHESTRATOR_POLICY_ID})\n`);
  for (const line of formatPilotScaleExpansionExecutionLines(summary)) {
    logger.cli(line);
  }
  logger.cli(`\nJSON: ${PILOT_SCALE_EXPANSION_EXECUTION_SUMMARY_ARTIFACT}`);
  logger.cli(`HTML: ${PILOT_SCALE_EXPANSION_EXECUTION_HTML_ARTIFACT}`);
  logger.cli("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    logger.cli(`  ${command}`);
  }
  logger.cli(`\n${summary.honestyNote}\n`);

  process.exit(summary.milestone === "pilot_scale_expansion_passed" ? 0 : 1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

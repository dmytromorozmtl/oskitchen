#!/usr/bin/env npx tsx
/**
 * Step 13 — Maintenance mode execution orchestrator.
 * Policy: era41-maintenance-mode-execution-v1
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { ContinuousImprovementLoopExecutionSummary } from "@/lib/ops/continuous-improvement-loop-execution-orchestrator";
import { renderMaintenanceModeExecutionHtml } from "@/lib/ops/maintenance-mode-execution-html";
import {
  buildMaintenanceModeExecutionSummary,
  formatMaintenanceModeExecutionLines,
  MAINTENANCE_MODE_EXECUTION_HTML_ARTIFACT,
  MAINTENANCE_MODE_EXECUTION_POLICY_ID,
  MAINTENANCE_MODE_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/maintenance-mode-execution-orchestrator";
import type { MarketLeaderPositioningExecutionSummary } from "@/lib/ops/market-leader-positioning-execution-orchestrator";
import type { ProductionGaExecutionSummary } from "@/lib/ops/production-ga-execution-orchestrator";
import type { PilotScaleExpansionExecutionSummary } from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";
import type { SeriesAPartnerExpansionExecutionSummary } from "@/lib/ops/series-a-partner-expansion-execution-orchestrator";
import type { SustainedOperationalExcellenceExecutionSummary } from "@/lib/ops/sustained-operational-excellence-execution-orchestrator";
import type { SustainedProductEvolutionExecutionSummary } from "@/lib/ops/sustained-product-evolution-execution-orchestrator";
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
  return buildMaintenanceModeExecutionSummary({
    ciLoopExecution: loadJson<ContinuousImprovementLoopExecutionSummary>(
      "artifacts/continuous-improvement-loop-execution-summary.json",
    ),
    productEvolutionExecution: loadJson<SustainedProductEvolutionExecutionSummary>(
      "artifacts/sustained-product-evolution-execution-summary.json",
    ),
    sustainedOpsExecution: loadJson<SustainedOperationalExcellenceExecutionSummary>(
      "artifacts/sustained-operational-excellence-execution-summary.json",
    ),
    marketLeaderExecution: loadJson<MarketLeaderPositioningExecutionSummary>(
      "artifacts/market-leader-positioning-execution-summary.json",
    ),
    seriesAExpansion: loadJson<SeriesAPartnerExpansionExecutionSummary>(
      "artifacts/series-a-partner-expansion-execution-summary.json",
    ),
    productionGa: loadJson<ProductionGaExecutionSummary>(
      "artifacts/production-ga-execution-summary.json",
    ),
    scaleExpansion: loadJson<PilotScaleExpansionExecutionSummary>(
      "artifacts/pilot-scale-expansion-execution-summary.json",
    ),
    week1Execution: loadJson<PilotWeek1ExecutionOrchestratorSummary>(
      "artifacts/pilot-week1-execution-summary.json",
    ),
    goNoGo: loadJson<PilotGoNoGoSummary>("artifacts/pilot-gono-go-summary.json"),
  });
}

function writeExecutionArtifacts(
  summary: ReturnType<typeof buildMaintenanceModeExecutionSummary>,
): void {
  const jsonPath = join(process.cwd(), MAINTENANCE_MODE_EXECUTION_SUMMARY_ARTIFACT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const htmlPath = join(process.cwd(), MAINTENANCE_MODE_EXECUTION_HTML_ARTIFACT);
  writeFileSync(htmlPath, renderMaintenanceModeExecutionHtml(summary), "utf8");
}

function maybeExecuteNextStep(
  summary: ReturnType<typeof buildMaintenanceModeExecutionSummary>,
): void {
  if (summary.milestone === "continuous_improvement_loop_blocked") {
    logger.cli("\nContinuous improvement loop not passed — complete Step 12 first.\n");
    return;
  }

  if (summary.milestone === "awaiting_maintenance_mode_integrity") {
    logger.cli("\n→ npm run ops:validate-maintenance-mode-integrity\n");
    execSync("npm run ops:validate-maintenance-mode-integrity", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  if (summary.milestone === "awaiting_reentrant_integrity") {
    logger.cli("\n→ npm run ops:validate-sustained-product-evolution-re-entrant-integrity -- --json\n");
    execSync(
      "npm run ops:validate-sustained-product-evolution-re-entrant-integrity -- --json",
      { stdio: "inherit", env: process.env },
    );
    return;
  }

  if (summary.milestone === "awaiting_charter_lock_integrity") {
    logger.cli("\n→ npm run ops:validate-era25-post-re-entrant-charter-lock-integrity -- --json\n");
    execSync(
      "npm run ops:validate-era25-post-re-entrant-charter-lock-integrity -- --json",
      { stdio: "inherit", env: process.env },
    );
    return;
  }

  const next = summary.nextAttentionRhythm;
  if (next?.commands.length) {
    logger.cli(`\n→ npm run ${next.commands[0]}\n`);
    runNpmScript(next.commands[0]!);
    return;
  }

  if (summary.milestone === "awaiting_per_pilot_isolation") {
    logger.cli("\n→ npm run smoke:pilot-gono-go\n");
    runNpmScript("smoke:pilot-gono-go");
    return;
  }

  if (next) {
    logger.cli(`\nNext rhythm requires attention: ${next.label}\n${next.detail}\n`);
    return;
  }

  logger.cli(
    "\n→ npm run ops:run-maintenance-mode-post-product-evolution-orchestrator -- --write\n",
  );
  execSync(
    "npm run ops:run-maintenance-mode-post-product-evolution-orchestrator -- --write",
    { stdio: "inherit", env: process.env },
  );
}

export function runMaintenanceModeExecution(options?: {
  execute?: boolean;
  writeArtifacts?: boolean;
}): ReturnType<typeof buildMaintenanceModeExecutionSummary> {
  let summary = collectExecutionContext();

  if (options?.execute) {
    maybeExecuteNextStep(summary);
    summary = collectExecutionContext();
    execSync("npm run ops:run-continuous-improvement-loop-execution -- --write", {
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

  const summary = runMaintenanceModeExecution({ execute, writeArtifacts: true });

  if (jsonOnly) {
    logger.cli(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "maintenance_mode_passed" ? 0 : 1);
    return;
  }

  logger.cli(`\nMaintenance mode execution (${MAINTENANCE_MODE_EXECUTION_POLICY_ID})\n`);
  for (const line of formatMaintenanceModeExecutionLines(summary)) {
    logger.cli(line);
  }
  logger.cli(`\nJSON: ${MAINTENANCE_MODE_EXECUTION_SUMMARY_ARTIFACT}`);
  logger.cli(`HTML: ${MAINTENANCE_MODE_EXECUTION_HTML_ARTIFACT}`);
  logger.cli("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    logger.cli(`  ${command}`);
  }
  logger.cli(`\n${summary.honestyNote}\n`);

  process.exit(summary.milestone === "maintenance_mode_passed" ? 0 : 1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

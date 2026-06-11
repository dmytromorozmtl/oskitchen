#!/usr/bin/env npx tsx
/**
 * Step 12 — Continuous improvement loop execution orchestrator.
 * Policy: era40-continuous-improvement-loop-execution-v1
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { renderContinuousImprovementLoopExecutionHtml } from "@/lib/ops/continuous-improvement-loop-execution-html";
import {
  buildContinuousImprovementLoopExecutionSummary,
  formatContinuousImprovementLoopExecutionLines,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_HTML_ARTIFACT,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_POLICY_ID,
  CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/continuous-improvement-loop-execution-orchestrator";
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
  return buildContinuousImprovementLoopExecutionSummary({
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
  summary: ReturnType<typeof buildContinuousImprovementLoopExecutionSummary>,
): void {
  const jsonPath = join(process.cwd(), CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_SUMMARY_ARTIFACT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const htmlPath = join(process.cwd(), CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_HTML_ARTIFACT);
  writeFileSync(htmlPath, renderContinuousImprovementLoopExecutionHtml(summary), "utf8");
}

function maybeExecuteNextStep(
  summary: ReturnType<typeof buildContinuousImprovementLoopExecutionSummary>,
): void {
  if (summary.milestone === "sustained_product_evolution_blocked") {
    logger.cli("\nSustained product evolution not passed — complete Step 11 first.\n");
    return;
  }

  if (summary.milestone === "awaiting_ci_loop_integrity") {
    logger.cli("\n→ npm run ops:validate-continuous-improvement-loop-integrity\n");
    execSync("npm run ops:validate-continuous-improvement-loop-integrity", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  const next = summary.nextAttentionTrack;
  if (next?.smokeScripts.length) {
    logger.cli(`\n→ npm run ${next.smokeScripts[0]}\n`);
    runNpmScript(next.smokeScripts[0]!);
    return;
  }

  if (summary.milestone === "awaiting_per_pilot_isolation") {
    logger.cli("\n→ npm run smoke:pilot-gono-go\n");
    runNpmScript("smoke:pilot-gono-go");
    return;
  }

  if (summary.milestone === "awaiting_pure_ops_terminus") {
    logger.cli("\n→ npm run ops:validate-pure-operational-mode-terminus-era25 -- --json\n");
    execSync("npm run ops:validate-pure-operational-mode-terminus-era25 -- --json", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  if (summary.milestone === "awaiting_maintenance_mode_readiness") {
    logger.cli("\n→ npm run ops:validate-maintenance-mode -- --json\n");
    execSync("npm run ops:validate-maintenance-mode -- --json", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  if (next) {
    logger.cli(`\nNext track requires attention: ${next.label}\n${next.detail}\n`);
    return;
  }

  logger.cli(
    "\n→ npm run ops:run-continuous-improvement-loop-post-sustained-ops-orchestrator -- --write\n",
  );
  execSync(
    "npm run ops:run-continuous-improvement-loop-post-sustained-ops-orchestrator -- --write",
    { stdio: "inherit", env: process.env },
  );
}

export function runContinuousImprovementLoopExecution(options?: {
  execute?: boolean;
  writeArtifacts?: boolean;
}): ReturnType<typeof buildContinuousImprovementLoopExecutionSummary> {
  let summary = collectExecutionContext();

  if (options?.execute) {
    maybeExecuteNextStep(summary);
    summary = collectExecutionContext();
    execSync("npm run ops:run-sustained-product-evolution-execution -- --write", {
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

  const summary = runContinuousImprovementLoopExecution({ execute, writeArtifacts: true });

  if (jsonOnly) {
    logger.cli(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "continuous_improvement_loop_passed" ? 0 : 1);
    return;
  }

  logger.cli(
    `\nContinuous improvement loop execution (${CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_POLICY_ID})\n`,
  );
  for (const line of formatContinuousImprovementLoopExecutionLines(summary)) {
    logger.cli(line);
  }
  logger.cli(`\nJSON: ${CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_SUMMARY_ARTIFACT}`);
  logger.cli(`HTML: ${CONTINUOUS_IMPROVEMENT_LOOP_EXECUTION_HTML_ARTIFACT}`);
  logger.cli("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    logger.cli(`  ${command}`);
  }
  logger.cli(`\n${summary.honestyNote}\n`);

  process.exit(summary.milestone === "continuous_improvement_loop_passed" ? 0 : 1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

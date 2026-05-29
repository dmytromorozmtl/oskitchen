#!/usr/bin/env npx tsx
/**
 * Step 9 — Market leader positioning execution orchestrator.
 * Policy: era37-market-leader-positioning-execution-v1
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { renderMarketLeaderPositioningExecutionHtml } from "@/lib/ops/market-leader-positioning-execution-html";
import {
  buildMarketLeaderPositioningExecutionSummary,
  formatMarketLeaderPositioningExecutionLines,
  MARKET_LEADER_POSITIONING_EXECUTION_HTML_ARTIFACT,
  MARKET_LEADER_POSITIONING_EXECUTION_POLICY_ID,
  MARKET_LEADER_POSITIONING_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/market-leader-positioning-execution-orchestrator";
import type { ProductionGaExecutionSummary } from "@/lib/ops/production-ga-execution-orchestrator";
import type { PilotScaleExpansionExecutionSummary } from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";
import type { SeriesAPartnerExpansionExecutionSummary } from "@/lib/ops/series-a-partner-expansion-execution-orchestrator";

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
  return buildMarketLeaderPositioningExecutionSummary({
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
  summary: ReturnType<typeof buildMarketLeaderPositioningExecutionSummary>,
): void {
  const jsonPath = join(process.cwd(), MARKET_LEADER_POSITIONING_EXECUTION_SUMMARY_ARTIFACT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const htmlPath = join(process.cwd(), MARKET_LEADER_POSITIONING_EXECUTION_HTML_ARTIFACT);
  writeFileSync(htmlPath, renderMarketLeaderPositioningExecutionHtml(summary), "utf8");
}

function maybeExecuteNextStep(
  summary: ReturnType<typeof buildMarketLeaderPositioningExecutionSummary>,
): void {
  if (summary.milestone === "series_a_expansion_blocked") {
    console.log("\nSeries A expansion not passed — complete Step 8 first.\n");
    return;
  }

  if (summary.milestone === "awaiting_market_leader_integrity") {
    console.log("\n→ npm run ops:validate-market-leader-positioning-integrity\n");
    execSync("npm run ops:validate-market-leader-positioning-integrity", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  const next = summary.nextPhase;
  if (next?.smokeScripts.length) {
    console.log(`\n→ npm run ${next.smokeScripts[0]}\n`);
    runNpmScript(next.smokeScripts[0]!);
    return;
  }

  if (next) {
    console.log(`\nNext pillar requires attestation: ${next.label}\n${next.detail}\n`);
    return;
  }

  if (!summary.pillarsComplete) {
    console.log(
      "\n→ npm run ops:run-market-leader-positioning-post-series-a-orchestrator -- --write\n",
    );
    execSync("npm run ops:run-market-leader-positioning-post-series-a-orchestrator -- --write", {
      stdio: "inherit",
      env: process.env,
    });
  }
}

export function runMarketLeaderPositioningExecution(options?: {
  execute?: boolean;
  writeArtifacts?: boolean;
}): ReturnType<typeof buildMarketLeaderPositioningExecutionSummary> {
  let summary = collectExecutionContext();

  if (options?.execute) {
    maybeExecuteNextStep(summary);
    summary = collectExecutionContext();
    execSync("npm run ops:run-series-a-partner-expansion-execution -- --write", {
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

  const summary = runMarketLeaderPositioningExecution({ execute, writeArtifacts: true });

  if (jsonOnly) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "market_leader_positioning_passed" ? 0 : 1);
    return;
  }

  console.log(`\nMarket leader positioning execution (${MARKET_LEADER_POSITIONING_EXECUTION_POLICY_ID})\n`);
  for (const line of formatMarketLeaderPositioningExecutionLines(summary)) {
    console.log(line);
  }
  console.log(`\nJSON: ${MARKET_LEADER_POSITIONING_EXECUTION_SUMMARY_ARTIFACT}`);
  console.log(`HTML: ${MARKET_LEADER_POSITIONING_EXECUTION_HTML_ARTIFACT}`);
  console.log("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    console.log(`  ${command}`);
  }
  console.log(`\n${summary.honestyNote}\n`);

  process.exit(summary.milestone === "market_leader_positioning_passed" ? 0 : 1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

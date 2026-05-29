#!/usr/bin/env npx tsx
/**
 * Step 8 — Series A / partner expansion execution orchestrator.
 * Policy: era36-series-a-partner-expansion-execution-v1
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { ProductionGaExecutionSummary } from "@/lib/ops/production-ga-execution-orchestrator";
import type { PilotScaleExpansionExecutionSummary } from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";
import { renderSeriesAPartnerExpansionExecutionHtml } from "@/lib/ops/series-a-partner-expansion-execution-html";
import {
  buildSeriesAPartnerExpansionExecutionSummary,
  formatSeriesAPartnerExpansionExecutionLines,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_HTML_ARTIFACT,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_POLICY_ID,
  SERIES_A_PARTNER_EXPANSION_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/series-a-partner-expansion-execution-orchestrator";

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
  return buildSeriesAPartnerExpansionExecutionSummary({
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
  summary: ReturnType<typeof buildSeriesAPartnerExpansionExecutionSummary>,
): void {
  const jsonPath = join(process.cwd(), SERIES_A_PARTNER_EXPANSION_EXECUTION_SUMMARY_ARTIFACT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const htmlPath = join(process.cwd(), SERIES_A_PARTNER_EXPANSION_EXECUTION_HTML_ARTIFACT);
  writeFileSync(htmlPath, renderSeriesAPartnerExpansionExecutionHtml(summary), "utf8");
}

function maybeExecuteNextStep(
  summary: ReturnType<typeof buildSeriesAPartnerExpansionExecutionSummary>,
): void {
  if (summary.milestone === "production_ga_blocked") {
    console.log("\nProduction GA not passed — complete Step 7 first.\n");
    return;
  }

  if (summary.milestone === "awaiting_series_a_integrity") {
    console.log("\n→ npm run ops:validate-series-a-partner-expansion-integrity\n");
    execSync("npm run ops:validate-series-a-partner-expansion-integrity", {
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
    console.log(`\nNext track requires attestation: ${next.label}\n${next.detail}\n`);
    return;
  }

  if (!summary.tracksComplete) {
    console.log(
      "\n→ npm run ops:run-series-a-partner-expansion-post-scale-orchestrator -- --write\n",
    );
    execSync("npm run ops:run-series-a-partner-expansion-post-scale-orchestrator -- --write", {
      stdio: "inherit",
      env: process.env,
    });
  }
}

export function runSeriesAPartnerExpansionExecution(options?: {
  execute?: boolean;
  writeArtifacts?: boolean;
}): ReturnType<typeof buildSeriesAPartnerExpansionExecutionSummary> {
  let summary = collectExecutionContext();

  if (options?.execute) {
    maybeExecuteNextStep(summary);
    summary = collectExecutionContext();
    execSync("npm run ops:run-production-ga-execution -- --write", {
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

  const summary = runSeriesAPartnerExpansionExecution({ execute, writeArtifacts: true });

  if (jsonOnly) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "series_a_partner_expansion_passed" ? 0 : 1);
    return;
  }

  console.log(`\nSeries A partner expansion execution (${SERIES_A_PARTNER_EXPANSION_EXECUTION_POLICY_ID})\n`);
  for (const line of formatSeriesAPartnerExpansionExecutionLines(summary)) {
    console.log(line);
  }
  console.log(`\nJSON: ${SERIES_A_PARTNER_EXPANSION_EXECUTION_SUMMARY_ARTIFACT}`);
  console.log(`HTML: ${SERIES_A_PARTNER_EXPANSION_EXECUTION_HTML_ARTIFACT}`);
  console.log("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    console.log(`  ${command}`);
  }
  console.log(`\n${summary.honestyNote}\n`);

  process.exit(summary.milestone === "series_a_partner_expansion_passed" ? 0 : 1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

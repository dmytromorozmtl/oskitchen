#!/usr/bin/env npx tsx
/**
 * Step 7 — Production GA execution orchestrator.
 * Policy: era35-production-ga-execution-v1
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotScaleExpansionExecutionSummary } from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import { renderProductionGaExecutionHtml } from "@/lib/ops/production-ga-execution-html";
import {
  buildProductionGaExecutionSummary,
  formatProductionGaExecutionLines,
  PRODUCTION_GA_EXECUTION_HTML_ARTIFACT,
  PRODUCTION_GA_EXECUTION_POLICY_ID,
  PRODUCTION_GA_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/production-ga-execution-orchestrator";
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";

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
  return buildProductionGaExecutionSummary({
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
  summary: ReturnType<typeof buildProductionGaExecutionSummary>,
): void {
  const jsonPath = join(process.cwd(), PRODUCTION_GA_EXECUTION_SUMMARY_ARTIFACT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const htmlPath = join(process.cwd(), PRODUCTION_GA_EXECUTION_HTML_ARTIFACT);
  writeFileSync(htmlPath, renderProductionGaExecutionHtml(summary), "utf8");
}

function maybeExecuteNextStep(
  summary: ReturnType<typeof buildProductionGaExecutionSummary>,
): void {
  if (summary.milestone === "scale_expansion_blocked") {
    console.log("\nScale expansion not passed — complete Step 6 first.\n");
    return;
  }

  if (summary.milestone === "awaiting_scale_integrity") {
    console.log("\n→ npm run ops:validate-scale-readiness-integrity\n");
    execSync("npm run ops:validate-scale-readiness-integrity", {
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
    console.log(`\nNext phase requires attestation: ${next.label}\n${next.detail}\n`);
    return;
  }

  if (!summary.gaPhasesComplete) {
    console.log("\n→ npm run run:production-pilot-ready\n");
    execSync("npm run run:production-pilot-ready", { stdio: "inherit", env: process.env });
  }
}

export function runProductionGaExecution(options?: {
  execute?: boolean;
  writeArtifacts?: boolean;
}): ReturnType<typeof buildProductionGaExecutionSummary> {
  let summary = collectExecutionContext();

  if (options?.execute) {
    maybeExecuteNextStep(summary);
    summary = collectExecutionContext();
    execSync("npm run ops:run-pilot-scale-expansion-execution -- --write", {
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

  const summary = runProductionGaExecution({ execute, writeArtifacts: true });

  if (jsonOnly) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "production_ga_passed" ? 0 : 1);
    return;
  }

  console.log(`\nProduction GA execution (${PRODUCTION_GA_EXECUTION_POLICY_ID})\n`);
  for (const line of formatProductionGaExecutionLines(summary)) {
    console.log(line);
  }
  console.log(`\nJSON: ${PRODUCTION_GA_EXECUTION_SUMMARY_ARTIFACT}`);
  console.log(`HTML: ${PRODUCTION_GA_EXECUTION_HTML_ARTIFACT}`);
  console.log("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    console.log(`  ${command}`);
  }
  console.log(`\n${summary.honestyNote}\n`);

  process.exit(summary.milestone === "production_ga_passed" ? 0 : 1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

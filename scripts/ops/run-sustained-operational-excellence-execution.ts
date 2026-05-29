#!/usr/bin/env npx tsx
/**
 * Step 10 — Sustained operational excellence execution orchestrator.
 * Policy: era38-sustained-operational-excellence-execution-v1
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { MarketLeaderPositioningExecutionSummary } from "@/lib/ops/market-leader-positioning-execution-orchestrator";
import type { ProductionGaExecutionSummary } from "@/lib/ops/production-ga-execution-orchestrator";
import type { PilotScaleExpansionExecutionSummary } from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";
import type { SeriesAPartnerExpansionExecutionSummary } from "@/lib/ops/series-a-partner-expansion-execution-orchestrator";
import { renderSustainedOperationalExcellenceExecutionHtml } from "@/lib/ops/sustained-operational-excellence-execution-html";
import {
  buildSustainedOperationalExcellenceExecutionSummary,
  formatSustainedOperationalExcellenceExecutionLines,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_HTML_ARTIFACT,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_POLICY_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/sustained-operational-excellence-execution-orchestrator";

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
  return buildSustainedOperationalExcellenceExecutionSummary({
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
  summary: ReturnType<typeof buildSustainedOperationalExcellenceExecutionSummary>,
): void {
  const jsonPath = join(process.cwd(), SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_SUMMARY_ARTIFACT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const htmlPath = join(process.cwd(), SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_HTML_ARTIFACT);
  writeFileSync(htmlPath, renderSustainedOperationalExcellenceExecutionHtml(summary), "utf8");
}

function maybeExecuteNextStep(
  summary: ReturnType<typeof buildSustainedOperationalExcellenceExecutionSummary>,
): void {
  if (summary.milestone === "market_leader_positioning_blocked") {
    console.log("\nMarket leader positioning not passed — complete Step 9 first.\n");
    return;
  }

  if (summary.milestone === "awaiting_sustained_ops_integrity") {
    console.log("\n→ npm run ops:validate-sustained-operational-excellence-integrity\n");
    execSync("npm run ops:validate-sustained-operational-excellence-integrity", {
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
    console.log(`\nNext cadence requires attestation: ${next.label}\n${next.detail}\n`);
    return;
  }

  if (!summary.cadencesComplete) {
    console.log(
      "\n→ npm run ops:run-sustained-operational-excellence-post-market-leader-orchestrator -- --write\n",
    );
    execSync(
      "npm run ops:run-sustained-operational-excellence-post-market-leader-orchestrator -- --write",
      { stdio: "inherit", env: process.env },
    );
  }
}

export function runSustainedOperationalExcellenceExecution(options?: {
  execute?: boolean;
  writeArtifacts?: boolean;
}): ReturnType<typeof buildSustainedOperationalExcellenceExecutionSummary> {
  let summary = collectExecutionContext();

  if (options?.execute) {
    maybeExecuteNextStep(summary);
    summary = collectExecutionContext();
    execSync("npm run ops:run-market-leader-positioning-execution -- --write", {
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

  const summary = runSustainedOperationalExcellenceExecution({ execute, writeArtifacts: true });

  if (jsonOnly) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "sustained_operational_excellence_passed" ? 0 : 1);
    return;
  }

  console.log(
    `\nSustained operational excellence execution (${SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_POLICY_ID})\n`,
  );
  for (const line of formatSustainedOperationalExcellenceExecutionLines(summary)) {
    console.log(line);
  }
  console.log(`\nJSON: ${SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_SUMMARY_ARTIFACT}`);
  console.log(`HTML: ${SUSTAINED_OPERATIONAL_EXCELLENCE_EXECUTION_HTML_ARTIFACT}`);
  console.log("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    console.log(`  ${command}`);
  }
  console.log(`\n${summary.honestyNote}\n`);

  process.exit(summary.milestone === "sustained_operational_excellence_passed" ? 0 : 1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

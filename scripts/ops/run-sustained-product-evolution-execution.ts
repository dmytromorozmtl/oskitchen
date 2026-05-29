#!/usr/bin/env npx tsx
/**
 * Step 11 — Sustained product evolution execution orchestrator.
 * Policy: era39-sustained-product-evolution-execution-v1
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
import type { SustainedOperationalExcellenceExecutionSummary } from "@/lib/ops/sustained-operational-excellence-execution-orchestrator";
import { renderSustainedProductEvolutionExecutionHtml } from "@/lib/ops/sustained-product-evolution-execution-html";
import {
  buildSustainedProductEvolutionExecutionSummary,
  formatSustainedProductEvolutionExecutionLines,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_HTML_ARTIFACT,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_POLICY_ID,
  SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/sustained-product-evolution-execution-orchestrator";

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
  return buildSustainedProductEvolutionExecutionSummary({
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
  summary: ReturnType<typeof buildSustainedProductEvolutionExecutionSummary>,
): void {
  const jsonPath = join(process.cwd(), SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_SUMMARY_ARTIFACT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const htmlPath = join(process.cwd(), SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_HTML_ARTIFACT);
  writeFileSync(htmlPath, renderSustainedProductEvolutionExecutionHtml(summary), "utf8");
}

function maybeExecuteNextStep(
  summary: ReturnType<typeof buildSustainedProductEvolutionExecutionSummary>,
): void {
  if (summary.milestone === "sustained_operational_excellence_blocked") {
    console.log("\nSustained operational excellence not passed — complete Step 10 first.\n");
    return;
  }

  if (summary.milestone === "awaiting_product_evolution_integrity") {
    console.log("\n→ npm run ops:validate-sustained-product-evolution-integrity\n");
    execSync("npm run ops:validate-sustained-product-evolution-integrity", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  if (summary.milestone === "awaiting_track_customer_feedback") {
    console.log("\n→ npm run smoke:pilot-metrics-baseline\n");
    runNpmScript("smoke:pilot-metrics-baseline");
    return;
  }

  if (summary.milestone === "awaiting_track_competitor_leapfrog") {
    console.log("\n→ npm run smoke:competitor-feature-gap-matrix\n");
    runNpmScript("smoke:competitor-feature-gap-matrix");
    return;
  }

  if (summary.milestone === "awaiting_improvement_loop_closure") {
    console.log(
      "\n→ npm run ops:run-continuous-improvement-loop-post-sustained-ops-orchestrator -- --write\n",
    );
    execSync(
      "npm run ops:run-continuous-improvement-loop-post-sustained-ops-orchestrator -- --write",
      { stdio: "inherit", env: process.env },
    );
    return;
  }

  if (summary.milestone === "awaiting_pure_ops_terminus") {
    console.log(
      "\n→ npm run ops:validate-pure-operational-mode-terminus-era25 -- --json\n",
    );
    execSync("npm run ops:validate-pure-operational-mode-terminus-era25 -- --json", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  if (summary.nextAttentionTrack) {
    console.log(
      `\nNext track requires attention: ${summary.nextAttentionTrack.label}\n${summary.nextAttentionTrack.detail}\n`,
    );
    return;
  }

  console.log(
    "\n→ npm run ops:run-sustained-product-evolution-post-improvement-loop-orchestrator -- --write\n",
  );
  execSync(
    "npm run ops:run-sustained-product-evolution-post-improvement-loop-orchestrator -- --write",
    { stdio: "inherit", env: process.env },
  );
}

export function runSustainedProductEvolutionExecution(options?: {
  execute?: boolean;
  writeArtifacts?: boolean;
}): ReturnType<typeof buildSustainedProductEvolutionExecutionSummary> {
  let summary = collectExecutionContext();

  if (options?.execute) {
    maybeExecuteNextStep(summary);
    summary = collectExecutionContext();
    execSync("npm run ops:run-sustained-operational-excellence-execution -- --write", {
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

  const summary = runSustainedProductEvolutionExecution({ execute, writeArtifacts: true });

  if (jsonOnly) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "sustained_product_evolution_passed" ? 0 : 1);
    return;
  }

  console.log(
    `\nSustained product evolution execution (${SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_POLICY_ID})\n`,
  );
  for (const line of formatSustainedProductEvolutionExecutionLines(summary)) {
    console.log(line);
  }
  console.log(`\nJSON: ${SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_SUMMARY_ARTIFACT}`);
  console.log(`HTML: ${SUSTAINED_PRODUCT_EVOLUTION_EXECUTION_HTML_ARTIFACT}`);
  console.log("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    console.log(`  ${command}`);
  }
  console.log(`\n${summary.honestyNote}\n`);

  process.exit(summary.milestone === "sustained_product_evolution_passed" ? 0 : 1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

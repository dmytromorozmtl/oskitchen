#!/usr/bin/env npx tsx
/**
 * Step 14 — Production pilot ready closure execution orchestrator.
 * Policy: era42-production-pilot-ready-closure-execution-v1
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { CommercialGateExecutionSummary } from "@/lib/ops/commercial-gate-execution-orchestrator";
import type { ContinuousImprovementLoopExecutionSummary } from "@/lib/ops/continuous-improvement-loop-execution-orchestrator";
import type { MaintenanceModeExecutionSummary } from "@/lib/ops/maintenance-mode-execution-orchestrator";
import type { MarketLeaderPositioningExecutionSummary } from "@/lib/ops/market-leader-positioning-execution-orchestrator";
import type { P0StagingProofExecutionSummary } from "@/lib/ops/p0-staging-proof-execution-orchestrator";
import { renderProductionPilotReadyClosureExecutionHtml } from "@/lib/ops/production-pilot-ready-closure-execution-html";
import {
  buildProductionPilotReadyClosureExecutionSummary,
  formatProductionPilotReadyClosureExecutionLines,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_HTML_ARTIFACT,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_POLICY_ID,
  PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/production-pilot-ready-closure-execution-orchestrator";
import type { ProductionGaExecutionSummary } from "@/lib/ops/production-ga-execution-orchestrator";
import type { PilotScaleExpansionExecutionSummary } from "@/lib/ops/pilot-scale-expansion-execution-orchestrator";
import type { PilotWeek1ExecutionOrchestratorSummary } from "@/lib/ops/pilot-week1-execution-orchestrator";
import type { SeriesAPartnerExpansionExecutionSummary } from "@/lib/ops/series-a-partner-expansion-execution-orchestrator";
import type { SustainedOperationalExcellenceExecutionSummary } from "@/lib/ops/sustained-operational-excellence-execution-orchestrator";
import type { SustainedProductEvolutionExecutionSummary } from "@/lib/ops/sustained-product-evolution-execution-orchestrator";
import type { Tier2StagingProofExecutionSummary } from "@/lib/ops/tier2-staging-proof-execution-orchestrator";

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
  return buildProductionPilotReadyClosureExecutionSummary({
    maintenanceModeExecution: loadJson<MaintenanceModeExecutionSummary>(
      "artifacts/maintenance-mode-execution-summary.json",
    ),
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
    commercialGate: loadJson<CommercialGateExecutionSummary>(
      "artifacts/commercial-gate-execution-summary.json",
    ),
    tier2Execution: loadJson<Tier2StagingProofExecutionSummary>(
      "artifacts/tier2-staging-proof-execution-summary.json",
    ),
    p0Execution: loadJson<P0StagingProofExecutionSummary>(
      "artifacts/p0-staging-proof-execution-summary.json",
    ),
    goNoGo: loadJson<PilotGoNoGoSummary>("artifacts/pilot-gono-go-summary.json"),
  });
}

function writeExecutionArtifacts(
  summary: ReturnType<typeof buildProductionPilotReadyClosureExecutionSummary>,
): void {
  const jsonPath = join(process.cwd(), PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_SUMMARY_ARTIFACT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const htmlPath = join(process.cwd(), PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_HTML_ARTIFACT);
  writeFileSync(htmlPath, renderProductionPilotReadyClosureExecutionHtml(summary), "utf8");
}

function maybeExecuteNextStep(
  summary: ReturnType<typeof buildProductionPilotReadyClosureExecutionSummary>,
): void {
  if (summary.milestone === "awaiting_engineering_path_terminus_integrity") {
    console.log("\n→ npm run ops:validate-engineering-path-terminus-integrity -- --json\n");
    execSync("npm run ops:validate-engineering-path-terminus-integrity -- --json", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  if (summary.milestone === "awaiting_vault_readiness") {
    console.log("\n→ npm run check-vault-readiness -- --write\n");
    execSync("npm run check-vault-readiness -- --write", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  const blocked = summary.chainSteps.find((step) => !step.complete);
  if (blocked) {
    console.log(`\n→ ${blocked.command}\n`);
    execSync(blocked.command, { stdio: "inherit", env: process.env });
    return;
  }

  console.log("\n→ npm run run:production-pilot-ready\n");
  execSync("npm run run:production-pilot-ready", { stdio: "inherit", env: process.env });
}

export function runProductionPilotReadyClosureExecution(options?: {
  execute?: boolean;
  writeArtifacts?: boolean;
}): ReturnType<typeof buildProductionPilotReadyClosureExecutionSummary> {
  let summary = collectExecutionContext();

  if (options?.execute) {
    maybeExecuteNextStep(summary);
    summary = collectExecutionContext();
    execSync("npm run ops:run-maintenance-mode-execution -- --write", {
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

  const summary = runProductionPilotReadyClosureExecution({ execute, writeArtifacts: true });

  if (jsonOnly) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "production_pilot_ready_passed" ? 0 : 1);
    return;
  }

  console.log(
    `\nProduction pilot ready closure (${PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_POLICY_ID})\n`,
  );
  for (const line of formatProductionPilotReadyClosureExecutionLines(summary)) {
    console.log(line);
  }
  console.log(`\nJSON: ${PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_SUMMARY_ARTIFACT}`);
  console.log(`HTML: ${PRODUCTION_PILOT_READY_CLOSURE_EXECUTION_HTML_ARTIFACT}`);
  console.log("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    console.log(`  ${command}`);
  }
  console.log(`\n${summary.honestyNote}\n`);

  process.exit(summary.milestone === "production_pilot_ready_passed" ? 0 : 1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

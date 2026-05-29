#!/usr/bin/env npx tsx
/**
 * Step 4 — Commercial gate execution orchestrator.
 * Policy: era32-commercial-gate-execution-v1
 *
 * Default: assess phases + write honest execution report (no smoke runs).
 * --execute: run next incomplete commercial step when Tier 2 gate passed (PASS > SKIPPED).
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { renderCommercialGateExecutionHtml } from "@/lib/ops/commercial-gate-execution-html";
import {
  buildCommercialGateExecutionSummary,
  COMMERCIAL_GATE_EXECUTION_HTML_ARTIFACT,
  COMMERCIAL_GATE_EXECUTION_POLICY_ID,
  COMMERCIAL_GATE_EXECUTION_SUMMARY_ARTIFACT,
  formatCommercialGateExecutionLines,
  type IcpQualificationArtifact,
} from "@/lib/ops/commercial-gate-execution-orchestrator";
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

function runNpmScript(script: string): void {
  execSync(`npm run ${script}`, { stdio: "inherit", env: process.env });
}

function collectExecutionContext() {
  return buildCommercialGateExecutionSummary({
    tier2Execution: loadJson<Tier2StagingProofExecutionSummary>(
      "artifacts/tier2-staging-proof-execution-summary.json",
    ),
    goNoGo: loadJson<PilotGoNoGoSummary>("artifacts/pilot-gono-go-summary.json"),
    icpArtifact: loadJson<IcpQualificationArtifact>("artifacts/icp-qualification-result.json"),
  });
}

function writeExecutionArtifacts(
  summary: ReturnType<typeof buildCommercialGateExecutionSummary>,
): void {
  const jsonPath = join(process.cwd(), COMMERCIAL_GATE_EXECUTION_SUMMARY_ARTIFACT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const htmlPath = join(process.cwd(), COMMERCIAL_GATE_EXECUTION_HTML_ARTIFACT);
  writeFileSync(htmlPath, renderCommercialGateExecutionHtml(summary), "utf8");
}

function maybeExecuteNextStep(summary: ReturnType<typeof buildCommercialGateExecutionSummary>): void {
  if (summary.milestone === "tier2_execution_blocked") {
    console.log("\nTier 2 execution not passed — complete Step 3 first.\n");
    return;
  }

  const next = summary.nextPhase;
  if (!next) {
    if (summary.milestone === "awaiting_go_integrity") {
      console.log("\n→ npm run ops:validate-pilot-gono-go-integrity\n");
      execSync("npm run ops:validate-pilot-gono-go-integrity", {
        stdio: "inherit",
        env: process.env,
      });
      return;
    }
    if (summary.milestone === "awaiting_commercial_inflection") {
      console.log("\n→ npm run ops:run-commercial-inflection-readiness-orchestrator -- --write\n");
      execSync("npm run ops:run-commercial-inflection-readiness-orchestrator -- --write", {
        stdio: "inherit",
        env: process.env,
      });
      return;
    }
    return;
  }

  if (next.id === "icp_qualification") {
    if (!process.env.PILOT_GONOGO_ICP_INPUT_JSON?.trim()) {
      console.log(
        "\nICP env not set — export PILOT_GONOGO_ICP_INPUT_JSON from real prospect JSON first.\n",
      );
      console.log(
        "  export PILOT_GONOGO_ICP_INPUT_JSON=\"$(cat config/commercial/pilot-icp-prospect-draft.template.json)\"\n",
      );
      return;
    }
    console.log("\n→ npm run icp-qualification-check\n");
    runNpmScript("icp-qualification-check");
    return;
  }

  if (next.id === "sales_compliance" && next.smokeScripts.length > 0) {
    console.log(`\n→ npm run ${next.smokeScripts[0]}\n`);
    runNpmScript(next.smokeScripts[0]!);
    return;
  }

  if (next.id === "go_orchestrator") {
    if (!summary.readyForGoOrchestrator) {
      console.log("\nNot ready for GO orchestrator — complete ICP, sales compliance, and LOI first.\n");
      return;
    }
    console.log("\n→ npm run smoke:pilot-gono-go\n");
    runNpmScript("smoke:pilot-gono-go");
    return;
  }

  if (next.id === "loi_customer") {
    console.log(
      `\nNext phase requires signed LOI: ${next.label}\n${next.detail}\nSet PILOT_GONOGO_CUSTOMER_NAME + PILOT_GONOGO_LOI_SIGNED_DATE after legal sign-off.\n`,
    );
  }
}

export function runCommercialGateExecution(options?: {
  execute?: boolean;
  writeArtifacts?: boolean;
}): ReturnType<typeof buildCommercialGateExecutionSummary> {
  let summary = collectExecutionContext();

  if (options?.execute) {
    maybeExecuteNextStep(summary);
    summary = collectExecutionContext();
    execSync("npm run ops:run-commercial-go-closure-post-tier2-orchestrator -- --write", {
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

  const summary = runCommercialGateExecution({ execute, writeArtifacts: true });

  if (jsonOnly) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "commercial_gate_passed" ? 0 : 1);
    return;
  }

  console.log(`\nCommercial gate execution (${COMMERCIAL_GATE_EXECUTION_POLICY_ID})\n`);
  for (const line of formatCommercialGateExecutionLines(summary)) {
    console.log(line);
  }
  console.log(`\nJSON: ${COMMERCIAL_GATE_EXECUTION_SUMMARY_ARTIFACT}`);
  console.log(`HTML: ${COMMERCIAL_GATE_EXECUTION_HTML_ARTIFACT}`);
  console.log("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    console.log(`  ${command}`);
  }
  console.log(`\n${summary.honestyNote}\n`);

  process.exit(summary.milestone === "commercial_gate_passed" ? 0 : 1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

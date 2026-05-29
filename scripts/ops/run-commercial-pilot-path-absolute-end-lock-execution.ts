#!/usr/bin/env npx tsx
/**
 * Step 16 — Commercial pilot path absolute end lock execution orchestrator.
 * Policy: era44-commercial-pilot-path-absolute-end-lock-execution-v1
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { renderCommercialPilotPathAbsoluteEndLockExecutionHtml } from "@/lib/ops/commercial-pilot-path-absolute-end-lock-execution-html";
import {
  buildCommercialPilotPathAbsoluteEndLockExecutionSummary,
  formatCommercialPilotPathAbsoluteEndLockExecutionLines,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_HTML_ARTIFACT,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_POLICY_ID,
  COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_SUMMARY_ARTIFACT,
} from "@/lib/ops/commercial-pilot-path-absolute-end-lock-execution-orchestrator";
import type { SteadyStateOperatorLoopLockExecutionSummary } from "@/lib/ops/steady-state-operator-loop-lock-execution-orchestrator";

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
  return buildCommercialPilotPathAbsoluteEndLockExecutionSummary({
    steadyStateOperatorLoopLock: loadJson<SteadyStateOperatorLoopLockExecutionSummary>(
      "artifacts/steady-state-operator-loop-lock-execution-summary.json",
    ),
    goNoGo: loadJson<PilotGoNoGoSummary>("artifacts/pilot-gono-go-summary.json"),
  });
}

function writeExecutionArtifacts(
  summary: ReturnType<typeof buildCommercialPilotPathAbsoluteEndLockExecutionSummary>,
): void {
  const jsonPath = join(process.cwd(), COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_SUMMARY_ARTIFACT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const htmlPath = join(process.cwd(), COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_HTML_ARTIFACT);
  writeFileSync(htmlPath, renderCommercialPilotPathAbsoluteEndLockExecutionHtml(summary), "utf8");
}

function maybeExecuteNextStep(
  summary: ReturnType<typeof buildCommercialPilotPathAbsoluteEndLockExecutionSummary>,
): void {
  if (summary.milestone === "steady_state_operator_loop_blocked") {
    console.log("\n→ npm run ops:run-steady-state-operator-loop-lock-execution -- --write\n");
    execSync("npm run ops:run-steady-state-operator-loop-lock-execution -- --write", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  if (
    summary.milestone === "awaiting_absolute_end_active" ||
    summary.milestone === "awaiting_absolute_end_path_closure"
  ) {
    console.log(
      "\n→ npm run ops:run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator -- --write\n",
    );
    execSync(
      "npm run ops:run-commercial-pilot-path-absolute-end-post-steady-state-orchestrator -- --write",
      { stdio: "inherit", env: process.env },
    );
    return;
  }

  if (summary.milestone === "awaiting_absolute_end_integrity") {
    console.log(
      "\n→ npm run ops:validate-commercial-pilot-path-absolute-end-integrity -- --json\n",
    );
    execSync("npm run ops:validate-commercial-pilot-path-absolute-end-integrity -- --json", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  if (summary.milestone === "awaiting_absolute_end_report") {
    console.log("\n→ npm run ops:sync-commercial-pilot-path-absolute-end-report -- --write\n");
    execSync("npm run ops:sync-commercial-pilot-path-absolute-end-report -- --write", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  if (summary.milestone === "awaiting_linear_path_permanently_closed_integrity") {
    console.log("\n→ npm run ops:validate-linear-path-permanently-closed-integrity -- --json\n");
    execSync("npm run ops:validate-linear-path-permanently-closed-integrity -- --json", {
      stdio: "inherit",
      env: process.env,
    });
    return;
  }

  if (summary.milestone === "awaiting_per_pilot_isolation") {
    console.log("\n→ npm run smoke:pilot-gono-go\n");
    execSync("npm run smoke:pilot-gono-go", { stdio: "inherit", env: process.env });
    return;
  }

  console.log("\n→ npm run ops:validate-commercial-pilot-path-absolute-end -- --json\n");
  execSync("npm run ops:validate-commercial-pilot-path-absolute-end -- --json", {
    stdio: "inherit",
    env: process.env,
  });
}

export function runCommercialPilotPathAbsoluteEndLockExecution(options?: {
  execute?: boolean;
  writeArtifacts?: boolean;
}): ReturnType<typeof buildCommercialPilotPathAbsoluteEndLockExecutionSummary> {
  let summary = collectExecutionContext();

  if (options?.execute) {
    maybeExecuteNextStep(summary);
    summary = collectExecutionContext();
    execSync("npm run ops:run-steady-state-operator-loop-lock-execution -- --write", {
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

  const summary = runCommercialPilotPathAbsoluteEndLockExecution({ execute, writeArtifacts: true });

  if (jsonOnly) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "commercial_pilot_path_absolute_end_lock_passed" ? 0 : 1);
    return;
  }

  console.log(
    `\nCommercial pilot path absolute end lock (${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_POLICY_ID})\n`,
  );
  for (const line of formatCommercialPilotPathAbsoluteEndLockExecutionLines(summary)) {
    console.log(line);
  }
  console.log(`\nJSON: ${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_SUMMARY_ARTIFACT}`);
  console.log(`HTML: ${COMMERCIAL_PILOT_PATH_ABSOLUTE_END_LOCK_EXECUTION_HTML_ARTIFACT}`);
  console.log("\nRecommended:");
  for (const command of summary.recommendedCommands) {
    console.log(`  ${command}`);
  }
  console.log(`\n${summary.honestyNote}\n`);

  process.exit(summary.milestone === "commercial_pilot_path_absolute_end_lock_passed" ? 0 : 1);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}

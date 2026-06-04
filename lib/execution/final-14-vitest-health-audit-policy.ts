import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  TS_BUILD_GREEN_SUMMARY_ARTIFACT,
  TS_BUILD_GREEN_SUMMARY_VERSION,
} from "@/lib/execution/ts-build-green-policy";
import {
  VITEST_HEALTH_FINAL_ORCHESTRATOR_TESTS,
  VITEST_HEALTH_NPM_SCRIPT,
  VITEST_HEALTH_POLICY_ID,
  VITEST_HEALTH_RUNNER_SCRIPT,
  VITEST_HEALTH_SUMMARY_ARTIFACT,
  VITEST_HEALTH_SUMMARY_VERSION,
} from "@/lib/execution/vitest-health-policy";

/**
 * FINAL-14 — Vitest unit test health snapshot (task-208).
 */

export const FINAL_14_VITEST_HEALTH_POLICY_ID = VITEST_HEALTH_POLICY_ID;

export type Final14VitestHealthAuditReport = {
  policyId: typeof FINAL_14_VITEST_HEALTH_POLICY_ID;
  phaseId: "FINAL-14";
  taskSlot: number;
  artifactPresent: boolean;
  artifactSchemaValid: boolean;
  testsGreen: boolean;
  runnerScriptPresent: boolean;
  npmScriptWired: boolean;
  final13Passed: boolean;
  passed: boolean;
};

function readPackageScripts(root: string): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function readFinal13ArtifactPassed(root: string): boolean {
  const path = join(root, TS_BUILD_GREEN_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return false;
  const summary = JSON.parse(readFileSync(path, "utf8")) as {
    version?: string;
    overall?: string;
    typecheckErrorCount?: number;
    buildExitCode?: number;
  };
  return (
    summary.version === TS_BUILD_GREEN_SUMMARY_VERSION &&
    summary.overall === "PASS" &&
    summary.typecheckErrorCount === 0 &&
    summary.buildExitCode === 0
  );
}

export function auditFinal14VitestHealth(root = process.cwd()): Final14VitestHealthAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[13]!;
  const artifactPath = join(root, VITEST_HEALTH_SUMMARY_ARTIFACT);
  const artifactPresent = existsSync(artifactPath);

  let artifactSchemaValid = false;
  let testsGreen = false;

  if (artifactPresent) {
    const summary = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      version?: string;
      overall?: string;
      failedTestFiles?: number;
      runner?: string;
      honestyNote?: string;
      bundle?: string[];
    };

    artifactSchemaValid =
      summary.version === VITEST_HEALTH_SUMMARY_VERSION &&
      summary.runner === VITEST_HEALTH_RUNNER_SCRIPT &&
      typeof summary.honestyNote === "string" &&
      summary.honestyNote.length > 20 &&
      Array.isArray(summary.bundle) &&
      summary.bundle.length === VITEST_HEALTH_FINAL_ORCHESTRATOR_TESTS.length;

    testsGreen = summary.overall === "PASS" && (summary.failedTestFiles ?? 1) === 0;
  }

  const scripts = readPackageScripts(root);
  const npmScriptWired = scripts[VITEST_HEALTH_NPM_SCRIPT]?.includes("vitest") === true;
  const runnerScriptPresent = existsSync(join(root, VITEST_HEALTH_RUNNER_SCRIPT));
  const final13Passed = readFinal13ArtifactPassed(root);

  const passed =
    artifactPresent &&
    artifactSchemaValid &&
    testsGreen &&
    runnerScriptPresent &&
    npmScriptWired &&
    final13Passed;

  return {
    policyId: FINAL_14_VITEST_HEALTH_POLICY_ID,
    phaseId: "FINAL-14",
    taskSlot: phase.taskSlot,
    artifactPresent,
    artifactSchemaValid,
    testsGreen,
    runnerScriptPresent,
    npmScriptWired,
    final13Passed,
    passed,
  };
}

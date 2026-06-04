import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DASHBOARD_RSC_E2E_PROJECT,
  DASHBOARD_RSC_E2E_SPEC,
  DASHBOARD_RSC_GOLDEN_PATH_POLICY_ID,
  DASHBOARD_RSC_GOLDEN_PATH_ROUTES,
  DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_ARTIFACT,
  DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_VERSION,
  DASHBOARD_RSC_RUNNER_SCRIPT,
} from "@/lib/execution/dashboard-rsc-golden-path-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  VITEST_HEALTH_SUMMARY_ARTIFACT,
  VITEST_HEALTH_SUMMARY_VERSION,
} from "@/lib/execution/vitest-health-policy";

/**
 * FINAL-15 — Dashboard RSC golden path E2E gate (task-209).
 */

export const FINAL_15_E2E_GOLDEN_PATH_POLICY_ID = DASHBOARD_RSC_GOLDEN_PATH_POLICY_ID;

export type Final15E2eGoldenPathAuditReport = {
  policyId: typeof FINAL_15_E2E_GOLDEN_PATH_POLICY_ID;
  phaseId: "FINAL-15";
  taskSlot: number;
  e2eSpecPresent: boolean;
  routesRegistryHonest: boolean;
  artifactPresent: boolean;
  artifactSchemaValid: boolean;
  goldenPathHonest: boolean;
  runnerScriptPresent: boolean;
  final14Passed: boolean;
  passed: boolean;
};

function readFinal14ArtifactPassed(root: string): boolean {
  const path = join(root, VITEST_HEALTH_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return false;
  const summary = JSON.parse(readFileSync(path, "utf8")) as {
    version?: string;
    overall?: string;
    failedTestFiles?: number;
  };
  return (
    summary.version === VITEST_HEALTH_SUMMARY_VERSION &&
    summary.overall === "PASS" &&
    (summary.failedTestFiles ?? 1) === 0
  );
}

export function auditDashboardRscE2eSpec(root = process.cwd()): boolean {
  const path = join(root, DASHBOARD_RSC_E2E_SPEC);
  if (!existsSync(path)) return false;
  const source = readFileSync(path, "utf8");
  return (
    source.includes("dashboard RSC regression") &&
    DASHBOARD_RSC_GOLDEN_PATH_ROUTES.every((route) => source.includes(route))
  );
}

export function auditFinal15E2eGoldenPath(
  root = process.cwd(),
): Final15E2eGoldenPathAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[14]!;
  const e2eSpecPresent = existsSync(join(root, DASHBOARD_RSC_E2E_SPEC));
  const routesRegistryHonest = e2eSpecPresent && auditDashboardRscE2eSpec(root);

  const artifactPath = join(root, DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_ARTIFACT);
  const artifactPresent = existsSync(artifactPath);

  let artifactSchemaValid = false;
  let goldenPathHonest = false;

  if (artifactPresent) {
    const summary = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      version?: string;
      overall?: string;
      proofStatus?: string;
      routes?: string[];
      runner?: string;
      honestyNote?: string;
      playwrightProject?: string;
    };

    artifactSchemaValid =
      summary.version === DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_VERSION &&
      summary.runner === DASHBOARD_RSC_RUNNER_SCRIPT &&
      summary.playwrightProject === DASHBOARD_RSC_E2E_PROJECT &&
      typeof summary.honestyNote === "string" &&
      summary.honestyNote.length > 20 &&
      Array.isArray(summary.routes) &&
      summary.routes.length === DASHBOARD_RSC_GOLDEN_PATH_ROUTES.length;

    goldenPathHonest =
      summary.overall === "PASS" ||
      (summary.overall === "SKIPPED" &&
        (summary.proofStatus === "proof_skipped_missing_e2e_credentials" ||
          summary.proofStatus === "proof_skipped_playwright_bootstrap"));
  }

  const runnerScriptPresent = existsSync(join(root, DASHBOARD_RSC_RUNNER_SCRIPT));
  const final14Passed = readFinal14ArtifactPassed(root);

  const passed =
    routesRegistryHonest &&
    artifactPresent &&
    artifactSchemaValid &&
    goldenPathHonest &&
    runnerScriptPresent &&
    final14Passed;

  return {
    policyId: FINAL_15_E2E_GOLDEN_PATH_POLICY_ID,
    phaseId: "FINAL-15",
    taskSlot: phase.taskSlot,
    e2eSpecPresent,
    routesRegistryHonest,
    artifactPresent,
    artifactSchemaValid,
    goldenPathHonest,
    runnerScriptPresent,
    final14Passed,
    passed,
  };
}

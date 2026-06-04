import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";
import {
  INTEGRATION_HEALTH_DASHBOARD_PAGE,
  INTEGRATION_HEALTH_DASHBOARD_PAGE_MARKERS,
  INTEGRATION_HEALTH_HOME_MARKERS,
  INTEGRATION_HEALTH_HOME_PAGE,
  INTEGRATION_HEALTH_LANDING_COMPONENT,
  INTEGRATION_HEALTH_LANDING_MARKERS,
  INTEGRATION_HEALTH_MOAT_POLICY_ID,
  INTEGRATION_HEALTH_MOAT_RUNNER_SCRIPT,
  INTEGRATION_HEALTH_MOAT_SUMMARY_ARTIFACT,
  INTEGRATION_HEALTH_MOAT_SUMMARY_VERSION,
  INTEGRATION_HEALTH_MOAT_VITEST_SPEC,
  INTEGRATION_HEALTH_STRIP_COMPONENT,
  INTEGRATION_HEALTH_STRIP_MARKERS,
} from "@/lib/execution/integration-health-moat-policy";
import {
  WEBHOOK_SIGNATURE_MATRIX_SUMMARY_ARTIFACT,
  WEBHOOK_SIGNATURE_MATRIX_SUMMARY_VERSION,
} from "@/lib/execution/webhook-signature-matrix-policy";

/**
 * FINAL-18 — Integration Health moat surfaces gate (task-212).
 */

export const FINAL_18_INTEGRATION_HEALTH_POLICY_ID = INTEGRATION_HEALTH_MOAT_POLICY_ID;

export type Final18IntegrationHealthAuditReport = {
  policyId: typeof FINAL_18_INTEGRATION_HEALTH_POLICY_ID;
  phaseId: "FINAL-18";
  taskSlot: number;
  surfacesRegistryHonest: boolean;
  moatVitestSpecPresent: boolean;
  artifactPresent: boolean;
  artifactSchemaValid: boolean;
  moatHonest: boolean;
  runnerScriptPresent: boolean;
  final17Passed: boolean;
  passed: boolean;
};

function readFinal17ArtifactPassed(root: string): boolean {
  const path = join(root, WEBHOOK_SIGNATURE_MATRIX_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return false;
  const summary = JSON.parse(readFileSync(path, "utf8")) as {
    version?: string;
    overall?: string;
    proofStatus?: string;
    matrixVitestPassed?: boolean;
  };
  return (
    summary.version === WEBHOOK_SIGNATURE_MATRIX_SUMMARY_VERSION &&
    summary.overall === "PASS" &&
    summary.proofStatus === "proof_passed_matrix_and_static_audit" &&
    summary.matrixVitestPassed === true
  );
}

function fileHasMarkers(root: string, relativePath: string, markers: readonly string[]): boolean {
  const path = join(root, relativePath);
  if (!existsSync(path)) return false;
  const source = readFileSync(path, "utf8");
  return markers.every((marker) => source.includes(marker));
}

export function auditIntegrationHealthMoatSurfaces(root = process.cwd()): boolean {
  return (
    fileHasMarkers(root, INTEGRATION_HEALTH_STRIP_COMPONENT, INTEGRATION_HEALTH_STRIP_MARKERS) &&
    fileHasMarkers(root, INTEGRATION_HEALTH_LANDING_COMPONENT, INTEGRATION_HEALTH_LANDING_MARKERS) &&
    fileHasMarkers(root, INTEGRATION_HEALTH_HOME_PAGE, INTEGRATION_HEALTH_HOME_MARKERS) &&
    fileHasMarkers(root, INTEGRATION_HEALTH_DASHBOARD_PAGE, INTEGRATION_HEALTH_DASHBOARD_PAGE_MARKERS)
  );
}

export function auditFinal18IntegrationHealthMoat(
  root = process.cwd(),
): Final18IntegrationHealthAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[17]!;
  const surfacesRegistryHonest = auditIntegrationHealthMoatSurfaces(root);
  const moatVitestSpecPresent = existsSync(join(root, INTEGRATION_HEALTH_MOAT_VITEST_SPEC));

  const artifactPath = join(root, INTEGRATION_HEALTH_MOAT_SUMMARY_ARTIFACT);
  const artifactPresent = existsSync(artifactPath);

  let artifactSchemaValid = false;
  let moatHonest = false;

  if (artifactPresent) {
    const summary = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      version?: string;
      overall?: string;
      proofStatus?: string;
      moatVitestPassed?: boolean;
      stripPresent?: boolean;
      landingPresent?: boolean;
      dashboardPagePresent?: boolean;
      runner?: string;
      honestyNote?: string;
    };

    artifactSchemaValid =
      summary.version === INTEGRATION_HEALTH_MOAT_SUMMARY_VERSION &&
      summary.runner === INTEGRATION_HEALTH_MOAT_RUNNER_SCRIPT &&
      typeof summary.honestyNote === "string" &&
      summary.honestyNote.length > 20 &&
      summary.moatVitestPassed === true &&
      summary.stripPresent === true &&
      summary.landingPresent === true &&
      summary.dashboardPagePresent === true;

    moatHonest =
      summary.overall === "PASS" && summary.proofStatus === "proof_passed_moat_surfaces";
  }

  const runnerScriptPresent = existsSync(join(root, INTEGRATION_HEALTH_MOAT_RUNNER_SCRIPT));
  const final17Passed = readFinal17ArtifactPassed(root);

  const passed =
    surfacesRegistryHonest &&
    moatVitestSpecPresent &&
    artifactPresent &&
    artifactSchemaValid &&
    moatHonest &&
    runnerScriptPresent &&
    final17Passed;

  return {
    policyId: FINAL_18_INTEGRATION_HEALTH_POLICY_ID,
    phaseId: "FINAL-18",
    taskSlot: phase.taskSlot,
    surfacesRegistryHonest,
    moatVitestSpecPresent,
    artifactPresent,
    artifactSchemaValid,
    moatHonest,
    runnerScriptPresent,
    final17Passed,
    passed,
  };
}

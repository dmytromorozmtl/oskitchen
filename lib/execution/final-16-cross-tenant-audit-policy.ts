import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CROSS_TENANT_CONTRACT_MARKERS,
  CROSS_TENANT_E2E_PROJECT,
  CROSS_TENANT_E2E_SPEC,
  CROSS_TENANT_ISOLATION_POLICY_ID,
  CROSS_TENANT_ISOLATION_SUMMARY_ARTIFACT,
  CROSS_TENANT_ISOLATION_SUMMARY_VERSION,
  CROSS_TENANT_RUNNER_SCRIPT,
} from "@/lib/execution/cross-tenant-isolation-policy";
import {
  DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_ARTIFACT,
  DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_VERSION,
} from "@/lib/execution/dashboard-rsc-golden-path-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

/**
 * FINAL-16 — Cross-tenant isolation staging E2E gate (task-210).
 */

export const FINAL_16_CROSS_TENANT_POLICY_ID = CROSS_TENANT_ISOLATION_POLICY_ID;

export type Final16CrossTenantAuditReport = {
  policyId: typeof FINAL_16_CROSS_TENANT_POLICY_ID;
  phaseId: "FINAL-16";
  taskSlot: number;
  e2eSpecPresent: boolean;
  contractRegistryHonest: boolean;
  artifactPresent: boolean;
  artifactSchemaValid: boolean;
  isolationHonest: boolean;
  runnerScriptPresent: boolean;
  final15Passed: boolean;
  passed: boolean;
};

function readFinal15ArtifactPassed(root: string): boolean {
  const path = join(root, DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return false;
  const summary = JSON.parse(readFileSync(path, "utf8")) as {
    version?: string;
    overall?: string;
    proofStatus?: string;
  };
  if (summary.version !== DASHBOARD_RSC_GOLDEN_PATH_SUMMARY_VERSION) return false;
  return (
    summary.overall === "PASS" ||
    (summary.overall === "SKIPPED" &&
      (summary.proofStatus === "proof_skipped_missing_e2e_credentials" ||
        summary.proofStatus === "proof_skipped_playwright_bootstrap"))
  );
}

export function auditCrossTenantE2eSpec(root = process.cwd()): boolean {
  const path = join(root, CROSS_TENANT_E2E_SPEC);
  if (!existsSync(path)) return false;
  const source = readFileSync(path, "utf8");
  return (
    source.includes("cross-tenant isolation") &&
    CROSS_TENANT_CONTRACT_MARKERS.every((marker) => source.includes(marker))
  );
}

export function auditFinal16CrossTenantIsolation(
  root = process.cwd(),
): Final16CrossTenantAuditReport {
  const phase = FINAL_ORCHESTRATOR_PHASES[15]!;
  const e2eSpecPresent = existsSync(join(root, CROSS_TENANT_E2E_SPEC));
  const contractRegistryHonest = e2eSpecPresent && auditCrossTenantE2eSpec(root);

  const artifactPath = join(root, CROSS_TENANT_ISOLATION_SUMMARY_ARTIFACT);
  const artifactPresent = existsSync(artifactPath);

  let artifactSchemaValid = false;
  let isolationHonest = false;

  if (artifactPresent) {
    const summary = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      version?: string;
      overall?: string;
      proofStatus?: string;
      mockContractPassed?: boolean;
      stagingOverall?: string;
      runner?: string;
      honestyNote?: string;
      playwrightProject?: string;
    };

    artifactSchemaValid =
      summary.version === CROSS_TENANT_ISOLATION_SUMMARY_VERSION &&
      summary.runner === CROSS_TENANT_RUNNER_SCRIPT &&
      summary.playwrightProject === CROSS_TENANT_E2E_PROJECT &&
      typeof summary.honestyNote === "string" &&
      summary.honestyNote.length > 20 &&
      summary.mockContractPassed === true;

    isolationHonest =
      summary.overall === "PASS" ||
      (summary.overall === "SKIPPED" &&
        (summary.proofStatus === "proof_skipped_missing_e2e_credentials" ||
          summary.proofStatus === "proof_skipped_playwright_bootstrap" ||
          summary.proofStatus === "proof_passed_mock_contract_staging_skipped"));
  }

  const runnerScriptPresent = existsSync(join(root, CROSS_TENANT_RUNNER_SCRIPT));
  const final15Passed = readFinal15ArtifactPassed(root);

  const passed =
    contractRegistryHonest &&
    artifactPresent &&
    artifactSchemaValid &&
    isolationHonest &&
    runnerScriptPresent &&
    final15Passed;

  return {
    policyId: FINAL_16_CROSS_TENANT_POLICY_ID,
    phaseId: "FINAL-16",
    taskSlot: phase.taskSlot,
    e2eSpecPresent,
    contractRegistryHonest,
    artifactPresent,
    artifactSchemaValid,
    isolationHonest,
    runnerScriptPresent,
    final15Passed,
    passed,
  };
}

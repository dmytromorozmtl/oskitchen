import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditScimProvisionUiE2E } from "@/lib/qa/scim-provision-ui-e2e-audit";
import {
  SCIM_PROVISION_UI_E2E_P1_39_ARTIFACT,
  SCIM_PROVISION_UI_E2E_P1_39_CHAIN,
  SCIM_PROVISION_UI_E2E_P1_39_POLICY_ID,
} from "@/lib/qa/scim-provision-ui-e2e-p1-39-policy";
import { SCIM_PROVISION_UI_E2E_FLOW_STEPS } from "@/lib/qa/scim-provision-ui-e2e-policy";

export type ScimProvisionUiE2EP139AuditSummary = {
  policyId: typeof SCIM_PROVISION_UI_E2E_P1_39_POLICY_ID;
  chain: readonly string[];
  flowSteps: readonly string[];
  baseAuditPassed: boolean;
  userGroupWired: boolean;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditScimProvisionUiE2EP139(
  root = process.cwd(),
): ScimProvisionUiE2EP139AuditSummary {
  const base = auditScimProvisionUiE2E(root);
  const artifactPresent = existsSync(join(root, SCIM_PROVISION_UI_E2E_P1_39_ARTIFACT));

  const flowStepsMatch =
    SCIM_PROVISION_UI_E2E_FLOW_STEPS.includes("configure_idp") &&
    SCIM_PROVISION_UI_E2E_FLOW_STEPS.includes("assign_user_group") &&
    SCIM_PROVISION_UI_E2E_FLOW_STEPS.includes("verify_deprovisioned");

  const passed =
    base.passed &&
    base.userGroupWired &&
    flowStepsMatch &&
    artifactPresent &&
    SCIM_PROVISION_UI_E2E_P1_39_CHAIN.length === 5;

  return {
    policyId: SCIM_PROVISION_UI_E2E_P1_39_POLICY_ID,
    chain: SCIM_PROVISION_UI_E2E_P1_39_CHAIN,
    flowSteps: SCIM_PROVISION_UI_E2E_FLOW_STEPS,
    baseAuditPassed: base.passed,
    userGroupWired: base.userGroupWired,
    artifactPresent,
    passed,
  };
}

export function formatScimProvisionUiE2EP139AuditLines(
  summary: ScimProvisionUiE2EP139AuditSummary,
): string[] {
  return [
    `SCIM provision UI E2E (P1-39) audit (${summary.policyId})`,
    `Chain: ${summary.chain.join(" → ")}`,
    `Flow steps: ${summary.flowSteps.join(" → ")}`,
    `Base E2E audit: ${summary.baseAuditPassed ? "passed" : "failed"}`,
    `User group wired: ${summary.userGroupWired ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

export function readScimProvisionUiE2EP139Artifact(root = process.cwd()): {
  policyId: string;
  chain: string[];
  flowSteps: string[];
} | null {
  const path = join(root, SCIM_PROVISION_UI_E2E_P1_39_ARTIFACT);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as {
    policyId: string;
    chain: string[];
    flowSteps: string[];
  };
}

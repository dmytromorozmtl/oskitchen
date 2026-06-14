import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SCIM_PROVISION_UI_E2E_FLOW_HELPER,
  SCIM_PROVISION_UI_E2E_FLOW_STEPS,
  SCIM_PROVISION_UI_E2E_POLICY_ID,
  SCIM_PROVISION_UI_E2E_READY_HELPER,
  SCIM_PROVISION_UI_E2E_SPEC,
  SCIM_PROVISION_USERS_PANEL_TEST_ID,
} from "@/lib/qa/scim-provision-ui-e2e-policy";

export type ScimProvisionUiE2EAuditSummary = {
  policyId: typeof SCIM_PROVISION_UI_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  panelComponentPresent: boolean;
  deactivateActionWired: boolean;
  userGroupWired: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditScimProvisionUiE2E(root = process.cwd()): ScimProvisionUiE2EAuditSummary {
  const specPath = join(root, SCIM_PROVISION_UI_E2E_SPEC);
  const flowPath = join(root, SCIM_PROVISION_UI_E2E_FLOW_HELPER);
  const readyPath = join(root, SCIM_PROVISION_UI_E2E_READY_HELPER);
  const panelPath = join(root, "components/enterprise/scim-provisioned-users-panel.tsx");
  const actionPath = join(root, "actions/workspace-scim.ts");

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);
  const panelComponentPresent = existsSync(panelPath);

  let deactivateActionWired = false;
  if (existsSync(actionPath)) {
    const source = readFileSync(actionPath, "utf8");
    deactivateActionWired =
      source.includes("deactivateScimProvisionedUserAction") &&
      source.includes("patchScimUser");
  }

  let panelTestIdsWired = false;
  if (panelComponentPresent) {
    const source = readFileSync(panelPath, "utf8");
    panelTestIdsWired =
      source.includes("SCIM_PROVISION_USERS_PANEL_TEST_ID") &&
      source.includes("deactivateScimProvisionedUserAction");
  }

  const specReferencesPolicy =
    specPresent && readFileSync(specPath, "utf8").includes(SCIM_PROVISION_UI_E2E_POLICY_ID);

  let flowWired = false;
  let userGroupWired = false;
  if (flowHelperPresent) {
    const source = readFileSync(flowPath, "utf8");
    flowWired =
      source.includes("createScimUserViaApi") &&
      source.includes("deactivateScimUserFromUi") &&
      source.includes("assertScimUserRevokedInDb");
    userGroupWired =
      source.includes("fetchScimUserGroupViaApi") &&
      source.includes("assign_user_group") &&
      source.includes("scimGroupsApiPath");
  }

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    panelComponentPresent &&
    deactivateActionWired &&
    panelTestIdsWired &&
    flowWired &&
    userGroupWired &&
    specReferencesPolicy &&
    SCIM_PROVISION_UI_E2E_FLOW_STEPS.length === 6;

  return {
    policyId: SCIM_PROVISION_UI_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    panelComponentPresent,
    deactivateActionWired,
    userGroupWired,
    flowStepCount: SCIM_PROVISION_UI_E2E_FLOW_STEPS.length,
    passed,
  };
}

export function formatScimProvisionUiE2EAuditLines(
  summary: ScimProvisionUiE2EAuditSummary,
): string[] {
  return [
    `SCIM provision UI E2E audit (${summary.policyId})`,
    `Spec (${SCIM_PROVISION_UI_E2E_SPEC}): ${summary.specPresent ? "yes" : "no"}`,
    `Flow helper: ${summary.flowHelperPresent ? "yes" : "no"}`,
    `Ready helper: ${summary.readyHelperPresent ? "yes" : "no"}`,
    `Provision panel component: ${summary.panelComponentPresent ? "yes" : "no"}`,
    `Deactivate action wired: ${summary.deactivateActionWired ? "yes" : "no"}`,
    `User group wired: ${summary.userGroupWired ? "yes" : "no"}`,
    `Flow steps (${summary.flowStepCount}): ${summary.flowStepCount === 6 ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

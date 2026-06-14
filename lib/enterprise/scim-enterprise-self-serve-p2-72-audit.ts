import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DEFAULT_SCIM_GROUP_MAPPINGS,
  resolveScimRoleFromIdpGroups,
} from "@/lib/enterprise/scim-enterprise-self-serve-p2-72-settings";
import {
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_ACTIONS,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_ARTIFACT,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_ATTRIBUTE_PANEL,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_ATTRIBUTE_PANEL_TEST_ID,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_EVAL_NOTE,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_FLOW_STEPS,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_GROUP_PANEL,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_GROUP_PANEL_TEST_ID,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_POLICY_ID,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_SAVE_ATTRIBUTE_MAPPING_TEST_ID,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_SAVE_GROUP_MAPPINGS_TEST_ID,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_SERVICE_MODULE,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_SETTINGS_MODULE,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_WIRING_PATHS,
} from "@/lib/enterprise/scim-enterprise-self-serve-p2-72-policy";

export type ScimEnterpriseSelfServeP272AuditSummary = {
  policyId: typeof SCIM_ENTERPRISE_SELF_SERVE_P2_72_POLICY_ID;
  wiringComplete: boolean;
  settingsWired: boolean;
  serviceWired: boolean;
  groupPanelWired: boolean;
  attributePanelWired: boolean;
  actionsWired: boolean;
  pageWired: boolean;
  groupRoleResolutionOk: boolean;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditScimEnterpriseSelfServeP272(
  root = process.cwd(),
): ScimEnterpriseSelfServeP272AuditSummary {
  const wiringComplete = SCIM_ENTERPRISE_SELF_SERVE_P2_72_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let settingsWired = false;
  if (existsSync(join(root, SCIM_ENTERPRISE_SELF_SERVE_P2_72_SETTINGS_MODULE))) {
    const source = readFileSync(join(root, SCIM_ENTERPRISE_SELF_SERVE_P2_72_SETTINGS_MODULE), "utf8");
    settingsWired =
      source.includes("resolveScimRoleFromIdpGroups") &&
      source.includes("applyScimAttributeMapping") &&
      source.includes("groupMappings");
  }

  let serviceWired = false;
  if (existsSync(join(root, SCIM_ENTERPRISE_SELF_SERVE_P2_72_SERVICE_MODULE))) {
    const source = readFileSync(join(root, SCIM_ENTERPRISE_SELF_SERVE_P2_72_SERVICE_MODULE), "utf8");
    serviceWired =
      source.includes("getScimEnterpriseSelfServeConfig") &&
      source.includes("saveScimGroupMappings");
  }

  let groupPanelWired = false;
  if (existsSync(join(root, SCIM_ENTERPRISE_SELF_SERVE_P2_72_GROUP_PANEL))) {
    const source = readFileSync(join(root, SCIM_ENTERPRISE_SELF_SERVE_P2_72_GROUP_PANEL), "utf8");
    groupPanelWired =
      source.includes(`data-testid="${SCIM_ENTERPRISE_SELF_SERVE_P2_72_GROUP_PANEL_TEST_ID}"`) &&
      source.includes(`data-testid="${SCIM_ENTERPRISE_SELF_SERVE_P2_72_SAVE_GROUP_MAPPINGS_TEST_ID}"`);
  }

  let attributePanelWired = false;
  if (existsSync(join(root, SCIM_ENTERPRISE_SELF_SERVE_P2_72_ATTRIBUTE_PANEL))) {
    const source = readFileSync(
      join(root, SCIM_ENTERPRISE_SELF_SERVE_P2_72_ATTRIBUTE_PANEL),
      "utf8",
    );
    attributePanelWired =
      source.includes(`data-testid="${SCIM_ENTERPRISE_SELF_SERVE_P2_72_ATTRIBUTE_PANEL_TEST_ID}"`) &&
      source.includes(
        `data-testid="${SCIM_ENTERPRISE_SELF_SERVE_P2_72_SAVE_ATTRIBUTE_MAPPING_TEST_ID}"`,
      );
  }

  let actionsWired = false;
  if (existsSync(join(root, SCIM_ENTERPRISE_SELF_SERVE_P2_72_ACTIONS))) {
    const source = readFileSync(join(root, SCIM_ENTERPRISE_SELF_SERVE_P2_72_ACTIONS), "utf8");
    actionsWired =
      source.includes("saveScimGroupMappingsAction") &&
      source.includes("saveScimAttributeMappingAction");
  }

  let pageWired = false;
  if (existsSync(join(root, "app/dashboard/enterprise/sso-scim/page.tsx"))) {
    const source = readFileSync(join(root, "app/dashboard/enterprise/sso-scim/page.tsx"), "utf8");
    pageWired =
      source.includes("ScimGroupProvisioningPanel") &&
      source.includes("ScimAttributeMappingPanel");
  }

  const groupRoleResolutionOk =
    resolveScimRoleFromIdpGroups(["KitchenOS Admins"], DEFAULT_SCIM_GROUP_MAPPINGS) === "ADMIN";

  const artifactPresent = existsSync(
    join(root, SCIM_ENTERPRISE_SELF_SERVE_P2_72_ARTIFACT),
  );

  const passed =
    wiringComplete &&
    settingsWired &&
    serviceWired &&
    groupPanelWired &&
    attributePanelWired &&
    actionsWired &&
    pageWired &&
    groupRoleResolutionOk &&
    artifactPresent &&
    SCIM_ENTERPRISE_SELF_SERVE_P2_72_FLOW_STEPS.length === 4;

  return {
    policyId: SCIM_ENTERPRISE_SELF_SERVE_P2_72_POLICY_ID,
    wiringComplete,
    settingsWired,
    serviceWired,
    groupPanelWired,
    attributePanelWired,
    actionsWired,
    pageWired,
    groupRoleResolutionOk,
    artifactPresent,
    passed,
  };
}

export function formatScimEnterpriseSelfServeP272AuditLines(
  summary: ScimEnterpriseSelfServeP272AuditSummary,
): string[] {
  return [
    `SCIM enterprise self-serve UI (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Settings module: ${summary.settingsWired ? "wired" : "missing"}`,
    `Service module: ${summary.serviceWired ? "wired" : "missing"}`,
    `Group provisioning panel: ${summary.groupPanelWired ? "yes" : "no"}`,
    `Attribute mapping panel: ${summary.attributePanelWired ? "yes" : "no"}`,
    `Actions: ${summary.actionsWired ? "wired" : "missing"}`,
    `SSO-SCIM page: ${summary.pageWired ? "wired" : "missing"}`,
    `Group role resolution: ${summary.groupRoleResolutionOk ? "ok" : "failed"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Eval note: ${SCIM_ENTERPRISE_SELF_SERVE_P2_72_EVAL_NOTE}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

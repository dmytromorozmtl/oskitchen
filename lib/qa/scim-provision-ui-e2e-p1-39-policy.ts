/**
 * P1-39 — SCIM provision UI E2E: IdP → user group → provision → delete → deprovisioning.
 *
 * @see docs/scim-provision-ui-e2e-p1-39.md
 * @see e2e/scim-provision-ui-e2e.spec.ts
 */

export {
  SCIM_DEFAULT_USER_GROUP_ID,
  SCIM_PROVISION_UI_E2E_FLOW_STEPS,
  SCIM_PROVISION_UI_E2E_PATH,
  SCIM_PROVISION_UI_E2E_SPEC,
  SCIM_PROVISION_UI_E2E_FLOW_HELPER,
  SCIM_PROVISION_UI_E2E_READY_HELPER,
  SCIM_PROVISION_UI_E2E_AUDIT_SCRIPT,
  SCIM_PROVISION_UI_E2E_UNIT_TEST,
  SCIM_PROVISION_USERS_PANEL_TEST_ID,
  scimGroupsApiPath,
  scimUsersApiPath,
  hasScimProvisionUiE2ECredentials,
  isScimProvisionUiE2EEnabled,
} from "@/lib/qa/scim-provision-ui-e2e-policy";

export const SCIM_PROVISION_UI_E2E_P1_39_POLICY_ID = "scim-provision-ui-e2e-p1-39-v1" as const;

export const SCIM_PROVISION_UI_E2E_P1_39_DOC = "docs/scim-provision-ui-e2e-p1-39.md" as const;

export const SCIM_PROVISION_UI_E2E_P1_39_ARTIFACT =
  "artifacts/scim-provision-ui-e2e-p1-39.json" as const;

export const SCIM_PROVISION_UI_E2E_P1_39_AUDIT_MODULE =
  "lib/qa/scim-provision-ui-e2e-p1-39-audit.ts" as const;

export const SCIM_PROVISION_UI_E2E_P1_39_CHECK_NPM_SCRIPT =
  "check:scim-provision-ui-e2e-p1-39" as const;

export const SCIM_PROVISION_UI_E2E_P1_39_CI_NPM_SCRIPT =
  "test:ci:scim-provision-ui-e2e-p1-39" as const;

export const SCIM_PROVISION_UI_E2E_P1_39_UNIT_TEST =
  "tests/unit/scim-provision-ui-e2e-p1-39.test.ts" as const;

export const SCIM_PROVISION_UI_E2E_P1_39_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const SCIM_PROVISION_UI_E2E_P1_39_E2E_NPM_SCRIPT =
  "test:e2e:scim-provision-ui-e2e" as const;

/** Gap-closure chain: IdP → user group → provision → delete → deprovisioning. */
export const SCIM_PROVISION_UI_E2E_P1_39_CHAIN = [
  "idp",
  "user_group",
  "provision",
  "delete",
  "deprovisioning",
] as const;

export const SCIM_PROVISION_UI_E2E_P1_39_WIRING_PATHS = [
  SCIM_PROVISION_UI_E2E_P1_39_DOC,
  SCIM_PROVISION_UI_E2E_P1_39_AUDIT_MODULE,
  SCIM_PROVISION_UI_E2E_P1_39_UNIT_TEST,
  SCIM_PROVISION_UI_E2E_P1_39_ARTIFACT,
  SCIM_PROVISION_UI_E2E_P1_39_CI_WORKFLOW,
  "lib/qa/scim-provision-ui-e2e-policy.ts",
  "lib/qa/scim-provision-ui-e2e-audit.ts",
  "e2e/scim-provision-ui-e2e.spec.ts",
  "e2e/helpers/scim-provision-ui-e2e-flow.ts",
  "components/enterprise/scim-provisioned-users-panel.tsx",
  "app/api/scim/v2/Groups/route.ts",
] as const;

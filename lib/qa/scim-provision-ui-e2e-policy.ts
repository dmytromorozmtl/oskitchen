/**
 * Blueprint P2-35 — SCIM provision UI E2E.
 *
 * create user → verify dashboard → deactivate → verify revoked
 *
 * @see e2e/scim-provision-ui-e2e.spec.ts
 * @see components/enterprise/scim-provisioned-users-panel.tsx
 */

import { ENTERPRISE_SSO_SCIM_LIVE_PATH } from "@/lib/enterprise/enterprise-sso-scim-live-policy";

export const SCIM_PROVISION_UI_E2E_POLICY_ID = "scim-provision-ui-e2e-p2-35-v1" as const;

export const SCIM_PROVISION_UI_E2E_SPEC = "e2e/scim-provision-ui-e2e.spec.ts" as const;

export const SCIM_PROVISION_UI_E2E_FLOW_HELPER = "e2e/helpers/scim-provision-ui-e2e-flow.ts" as const;

export const SCIM_PROVISION_UI_E2E_READY_HELPER = "e2e/helpers/scim-provision-ui-e2e-ready.ts" as const;

export const SCIM_PROVISION_UI_E2E_AUDIT_SCRIPT = "scripts/audit-scim-provision-ui-e2e.ts" as const;

export const SCIM_PROVISION_UI_E2E_NPM_SCRIPT = "audit:scim-provision-ui-e2e" as const;

export const SCIM_PROVISION_UI_E2E_UNIT_TEST = "tests/unit/scim-provision-ui-e2e.test.ts" as const;

export const SCIM_PROVISION_UI_E2E_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const SCIM_PROVISION_UI_E2E_PATH = ENTERPRISE_SSO_SCIM_LIVE_PATH;

export const SCIM_PROVISION_USERS_PANEL_TEST_ID = "scim-provision-users-panel" as const;

export const SCIM_PROVISION_USER_COUNT_TEST_ID = "scim-provision-user-count" as const;

export const SCIM_PROVISION_UI_E2E_VISIBLE_MS = 30_000 as const;

export const SCIM_PROVISION_UI_E2E_FLOW_STEPS = [
  "configure_idp",
  "assign_user_group",
  "provision_user",
  "verify_dashboard_ui",
  "deactivate_user_ui",
  "verify_deprovisioned",
] as const;

export type ScimProvisionUiE2EFlowStep = (typeof SCIM_PROVISION_UI_E2E_FLOW_STEPS)[number];

export function scimProvisionUserRowTestId(scimUserId: string): string {
  return `scim-provisioned-user-${scimUserId}`;
}

export function scimDeactivateUserTestId(scimUserId: string): string {
  return `scim-deactivate-user-${scimUserId}`;
}

export function scimProvisionUserStatusTestId(scimUserId: string): string {
  return `scim-provisioned-user-status-${scimUserId}`;
}

export const SCIM_PROVISION_USER_ROW_TEST_ID = scimProvisionUserRowTestId;
export const SCIM_DEACTIVATE_USER_TEST_ID = scimDeactivateUserTestId;
export const SCIM_PROVISION_USER_STATUS_TEST_ID = scimProvisionUserStatusTestId;

export function hasScimProvisionUiE2ECredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function isScimProvisionUiE2EEnabled(): boolean {
  return process.env.E2E_SCIM_PROVISION_UI?.trim() === "true";
}

export function scimUsersApiPath(): string {
  return "/api/scim/v2/Users";
}

export function scimGroupsApiPath(): string {
  return "/api/scim/v2/Groups";
}

export const SCIM_DEFAULT_USER_GROUP_ID = "group-staff" as const;

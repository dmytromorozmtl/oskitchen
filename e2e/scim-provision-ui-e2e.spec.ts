import { expect, test } from "@playwright/test";

import {
  SCIM_PROVISION_UI_E2E_FLOW_STEPS,
  SCIM_PROVISION_UI_E2E_PATH,
  SCIM_PROVISION_UI_E2E_POLICY_ID,
  SCIM_PROVISION_USERS_PANEL_TEST_ID,
  scimDeactivateUserTestId,
  scimProvisionUserRowTestId,
  scimProvisionUserStatusTestId,
  scimUsersApiPath,
} from "@/lib/qa/scim-provision-ui-e2e-policy";

import { runScimProvisionUiE2EFlow } from "./helpers/scim-provision-ui-e2e-flow";
import {
  skipScimProvisionUiE2EIfGateDisabled,
  skipScimProvisionUiE2EIfNoDb,
  skipScimProvisionUiE2EIfNotAuthed,
} from "./helpers/scim-provision-ui-e2e-ready";

/**
 * SCIM provision UI E2E — create user → verify dashboard → deactivate → verify revoked.
 *
 * @see components/enterprise/scim-provisioned-users-panel.tsx
 * @see app/api/scim/v2/Users/route.ts
 */

test.describe("scim provision ui e2e policy", () => {
  test("exports six-step IdP group provision deprovision flow", () => {
    expect(SCIM_PROVISION_UI_E2E_POLICY_ID).toBe("scim-provision-ui-e2e-p2-35-v1");
    expect(SCIM_PROVISION_UI_E2E_FLOW_STEPS).toEqual([
      "configure_idp",
      "assign_user_group",
      "provision_user",
      "verify_dashboard_ui",
      "deactivate_user_ui",
      "verify_deprovisioned",
    ]);
    expect(SCIM_PROVISION_UI_E2E_PATH).toBe("/dashboard/enterprise/sso-scim");
    expect(scimUsersApiPath()).toBe("/api/scim/v2/Users");
    expect(scimProvisionUserRowTestId("u1")).toBe("scim-provisioned-user-u1");
    expect(scimDeactivateUserTestId("u1")).toBe("scim-deactivate-user-u1");
    expect(scimProvisionUserStatusTestId("u1")).toBe("scim-provisioned-user-status-u1");
    expect(SCIM_PROVISION_USERS_PANEL_TEST_ID).toBe("scim-provision-users-panel");
  });
});

test.describe("scim provision ui e2e (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "SCIM provision UI E2E runs in chromium-authed project only",
    );
    skipScimProvisionUiE2EIfGateDisabled();
    skipScimProvisionUiE2EIfNotAuthed();
    skipScimProvisionUiE2EIfNoDb();
  });

  test("create user verify dashboard deactivate verify revoked", async ({ page, request }) => {
    const result = await runScimProvisionUiE2EFlow(page, request);
    expect(result.steps).toEqual(SCIM_PROVISION_UI_E2E_FLOW_STEPS);
    expect(result.userName).toContain("@example.com");
  });
});

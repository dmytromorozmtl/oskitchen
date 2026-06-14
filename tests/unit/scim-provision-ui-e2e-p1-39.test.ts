import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditScimProvisionUiE2EP139,
  formatScimProvisionUiE2EP139AuditLines,
  readScimProvisionUiE2EP139Artifact,
} from "@/lib/qa/scim-provision-ui-e2e-p1-39-audit";
import {
  SCIM_DEFAULT_USER_GROUP_ID,
  SCIM_PROVISION_UI_E2E_P1_39_ARTIFACT,
  SCIM_PROVISION_UI_E2E_P1_39_CHAIN,
  SCIM_PROVISION_UI_E2E_P1_39_CHECK_NPM_SCRIPT,
  SCIM_PROVISION_UI_E2E_P1_39_CI_NPM_SCRIPT,
  SCIM_PROVISION_UI_E2E_P1_39_CI_WORKFLOW,
  SCIM_PROVISION_UI_E2E_P1_39_DOC,
  SCIM_PROVISION_UI_E2E_P1_39_E2E_NPM_SCRIPT,
  SCIM_PROVISION_UI_E2E_P1_39_POLICY_ID,
  SCIM_PROVISION_UI_E2E_P1_39_WIRING_PATHS,
  SCIM_PROVISION_UI_E2E_FLOW_STEPS,
  scimGroupsApiPath,
  scimUsersApiPath,
} from "@/lib/qa/scim-provision-ui-e2e-p1-39-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("SCIM provision UI E2E (P1-39)", () => {
  it("locks P1-39 policy and IdP→group→provision→deprovision chain", () => {
    expect(SCIM_PROVISION_UI_E2E_P1_39_POLICY_ID).toBe("scim-provision-ui-e2e-p1-39-v1");
    expect(SCIM_PROVISION_UI_E2E_P1_39_CHAIN).toEqual([
      "idp",
      "user_group",
      "provision",
      "delete",
      "deprovisioning",
    ]);
    expect(SCIM_PROVISION_UI_E2E_FLOW_STEPS).toEqual([
      "configure_idp",
      "assign_user_group",
      "provision_user",
      "verify_dashboard_ui",
      "deactivate_user_ui",
      "verify_deprovisioned",
    ]);
    expect(SCIM_DEFAULT_USER_GROUP_ID).toBe("group-staff");
    expect(scimGroupsApiPath()).toBe("/api/scim/v2/Groups");
    expect(scimUsersApiPath()).toBe("/api/scim/v2/Users");
  });

  it("passes full P1-39 audit — E2E spec, group API, artifact wired", () => {
    const summary = auditScimProvisionUiE2EP139(ROOT);
    expect(summary.baseAuditPassed).toBe(true);
    expect(summary.userGroupWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("flow helper fetches IdP groups before user provision", () => {
    const flow = readSource("e2e/helpers/scim-provision-ui-e2e-flow.ts");
    expect(flow).toContain("fetchScimUserGroupViaApi");
    expect(flow).toContain("assign_user_group");
    expect(flow).toContain("verify_deprovisioned");
  });

  it("P1-39 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of SCIM_PROVISION_UI_E2E_P1_39_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${SCIM_PROVISION_UI_E2E_P1_39_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${SCIM_PROVISION_UI_E2E_P1_39_CI_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${SCIM_PROVISION_UI_E2E_P1_39_E2E_NPM_SCRIPT}"`);

    const ci = readSource(SCIM_PROVISION_UI_E2E_P1_39_CI_WORKFLOW);
    expect(ci).toContain(SCIM_PROVISION_UI_E2E_P1_39_CHECK_NPM_SCRIPT);

    const doc = readSource(SCIM_PROVISION_UI_E2E_P1_39_DOC);
    expect(doc).toContain(SCIM_PROVISION_UI_E2E_P1_39_POLICY_ID);

    const artifact = readScimProvisionUiE2EP139Artifact(ROOT);
    expect(artifact?.policyId).toBe(SCIM_PROVISION_UI_E2E_P1_39_POLICY_ID);
    expect(artifact?.chain).toEqual([...SCIM_PROVISION_UI_E2E_P1_39_CHAIN]);

    expect(existsSync(join(ROOT, SCIM_PROVISION_UI_E2E_P1_39_ARTIFACT))).toBe(true);
  });

  it("formats audit lines", () => {
    const summary = auditScimProvisionUiE2EP139(ROOT);
    const lines = formatScimProvisionUiE2EP139AuditLines(summary);
    expect(lines.some((line) => line.includes(SCIM_PROVISION_UI_E2E_P1_39_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditScimEnterpriseSelfServeP272,
  formatScimEnterpriseSelfServeP272AuditLines,
} from "@/lib/enterprise/scim-enterprise-self-serve-p2-72-audit";
import {
  applyScimAttributeMapping,
  DEFAULT_SCIM_GROUP_MAPPINGS,
  resolveScimRoleFromIdpGroups,
} from "@/lib/enterprise/scim-enterprise-self-serve-p2-72-settings";
import {
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_ARTIFACT,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_CHECK_NPM_SCRIPT,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_CI_NPM_SCRIPT,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_CI_WORKFLOW,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_DOC,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_FLOW_STEPS,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_GROUP_PANEL_TEST_ID,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_POLICY_ID,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_UNIT_TEST,
  SCIM_ENTERPRISE_SELF_SERVE_P2_72_WIRING_PATHS,
} from "@/lib/enterprise/scim-enterprise-self-serve-p2-72-policy";

const ROOT = process.cwd();

describe("SCIM enterprise self-serve UI (P2-72)", () => {
  it("locks P2-72 policy and flow steps", () => {
    expect(SCIM_ENTERPRISE_SELF_SERVE_P2_72_POLICY_ID).toBe(
      "scim-enterprise-self-serve-p2-72-v1",
    );
    expect(SCIM_ENTERPRISE_SELF_SERVE_P2_72_FLOW_STEPS).toEqual([
      "group_provisioning",
      "attribute_mapping",
      "self_serve_save",
      "scim_api_apply",
    ]);
    expect(DEFAULT_SCIM_GROUP_MAPPINGS).toHaveLength(3);
  });

  it("resolves IdP group names to workspace roles", () => {
    expect(
      resolveScimRoleFromIdpGroups(["KitchenOS Staff"], DEFAULT_SCIM_GROUP_MAPPINGS),
    ).toBe("STAFF");
    expect(
      resolveScimRoleFromIdpGroups(["Unknown Group"], DEFAULT_SCIM_GROUP_MAPPINGS),
    ).toBe("STAFF");
  });

  it("applies attribute mapping to SCIM payload", () => {
    const mapped = applyScimAttributeMapping(
      {
        userName: "ops@example.com",
        name: { formatted: "Ops Lead" },
        emails: [{ value: "ops@example.com", primary: true }],
      },
      {
        userNameSource: "userName",
        emailSource: "emails.primary",
        displayNameSource: "name.formatted",
        externalIdSource: "externalId",
        roleSource: "extension.role",
      },
    );
    expect(mapped.userName).toBe("ops@example.com");
    expect(mapped.displayName).toBe("Ops Lead");
  });

  it("passes full P2-72 SCIM enterprise self-serve audit", () => {
    const summary = auditScimEnterpriseSelfServeP272(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.settingsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.groupPanelWired).toBe(true);
    expect(summary.attributePanelWired).toBe(true);
    expect(summary.actionsWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.groupRoleResolutionOk).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-72 wiring paths, CI gate, and artifact", () => {
    for (const path of SCIM_ENTERPRISE_SELF_SERVE_P2_72_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[SCIM_ENTERPRISE_SELF_SERVE_P2_72_CHECK_NPM_SCRIPT]).toContain(
      SCIM_ENTERPRISE_SELF_SERVE_P2_72_UNIT_TEST,
    );
    expect(pkg.scripts?.[SCIM_ENTERPRISE_SELF_SERVE_P2_72_CI_NPM_SCRIPT]).toContain(
      SCIM_ENTERPRISE_SELF_SERVE_P2_72_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, SCIM_ENTERPRISE_SELF_SERVE_P2_72_CI_WORKFLOW), "utf8");
    expect(ci).toContain(SCIM_ENTERPRISE_SELF_SERVE_P2_72_CHECK_NPM_SCRIPT);

    const usersRoute = readFileSync(join(ROOT, "app/api/scim/v2/Users/route.ts"), "utf8");
    expect(usersRoute).toContain("getScimEnterpriseSelfServeConfig");
    expect(usersRoute).toContain("resolveScimRoleFromConfig");

    const groupPanel = readFileSync(
      join(ROOT, "components/enterprise/scim-group-provisioning-panel.tsx"),
      "utf8",
    );
    expect(groupPanel).toContain(`data-testid="${SCIM_ENTERPRISE_SELF_SERVE_P2_72_GROUP_PANEL_TEST_ID}"`);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, SCIM_ENTERPRISE_SELF_SERVE_P2_72_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(SCIM_ENTERPRISE_SELF_SERVE_P2_72_POLICY_ID);

    const doc = readFileSync(join(ROOT, SCIM_ENTERPRISE_SELF_SERVE_P2_72_DOC), "utf8");
    expect(doc).toContain(SCIM_ENTERPRISE_SELF_SERVE_P2_72_POLICY_ID);
    expect(doc).toContain("Attribute mapping");
  });

  it("formats audit lines", () => {
    const summary = auditScimEnterpriseSelfServeP272(ROOT);
    const lines = formatScimEnterpriseSelfServeP272AuditLines(summary);
    expect(lines.some((line) => line.includes(SCIM_ENTERPRISE_SELF_SERVE_P2_72_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});

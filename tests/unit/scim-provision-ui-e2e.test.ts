import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditScimProvisionUiE2E,
  formatScimProvisionUiE2EAuditLines,
} from "@/lib/qa/scim-provision-ui-e2e-audit";
import {
  SCIM_PROVISION_UI_E2E_AUDIT_SCRIPT,
  SCIM_PROVISION_UI_E2E_CI_WORKFLOW,
  SCIM_PROVISION_UI_E2E_FLOW_STEPS,
  SCIM_PROVISION_UI_E2E_NPM_SCRIPT,
  SCIM_PROVISION_UI_E2E_POLICY_ID,
  SCIM_PROVISION_UI_E2E_SPEC,
  SCIM_PROVISION_UI_E2E_UNIT_TEST,
  hasScimProvisionUiE2ECredentials,
  isScimProvisionUiE2EEnabled,
} from "@/lib/qa/scim-provision-ui-e2e-policy";

const ROOT = process.cwd();

describe("SCIM provision UI E2E (P2-35)", () => {
  it("locks policy id and five-step provision flow", () => {
    expect(SCIM_PROVISION_UI_E2E_POLICY_ID).toBe("scim-provision-ui-e2e-p2-35-v1");
    expect(SCIM_PROVISION_UI_E2E_FLOW_STEPS).toHaveLength(5);
  });

  it("audits spec, panel, deactivate action, and flow helper", () => {
    const summary = auditScimProvisionUiE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.readyHelperPresent).toBe(true);
    expect(summary.panelComponentPresent).toBe(true);
    expect(summary.deactivateActionWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, SCIM_PROVISION_UI_E2E_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, SCIM_PROVISION_UI_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, SCIM_PROVISION_UI_E2E_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[SCIM_PROVISION_UI_E2E_NPM_SCRIPT]).toContain(
      "audit-scim-provision-ui-e2e.ts",
    );
    expect(pkg.scripts?.["check:scim-provision-ui-e2e"]).toContain(SCIM_PROVISION_UI_E2E_UNIT_TEST);
    expect(pkg.scripts?.["test:e2e:scim-provision-ui-e2e"]).toContain(SCIM_PROVISION_UI_E2E_SPEC);

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:scim-provision-ui-e2e"]).toContain(
      SCIM_PROVISION_UI_E2E_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, SCIM_PROVISION_UI_E2E_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("scim-provision-ui-e2e");
  });

  it("formats audit lines", () => {
    const summary = auditScimProvisionUiE2E(ROOT);
    const lines = formatScimProvisionUiE2EAuditLines(summary);
    expect(lines.some((line) => line.includes(SCIM_PROVISION_UI_E2E_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });

  it("E2E gate requires E2E_SCIM_PROVISION_UI flag", () => {
    const original = process.env.E2E_SCIM_PROVISION_UI;
    delete process.env.E2E_SCIM_PROVISION_UI;
    expect(isScimProvisionUiE2EEnabled()).toBe(false);
    process.env.E2E_SCIM_PROVISION_UI = "true";
    expect(isScimProvisionUiE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_SCIM_PROVISION_UI = original;
    else delete process.env.E2E_SCIM_PROVISION_UI;
  });

  it("credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasScimProvisionUiE2ECredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});

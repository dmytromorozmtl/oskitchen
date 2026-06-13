import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditButtonRegressionP3_52,
  formatButtonRegressionP3_52AuditLines,
} from "@/lib/qa/button-regression-p3-52-audit";
import {
  BUTTON_REGRESSION_P3_52_SHELL_BUTTONS,
  buildButtonRegressionPageProbes,
  countButtonRegressionProbes,
  validateButtonRegressionContract,
} from "@/lib/qa/button-regression-p3-52-measurement";
import {
  BUTTON_REGRESSION_P3_52_AUDIT_SCRIPT,
  BUTTON_REGRESSION_P3_52_CHECK_NPM_SCRIPT,
  BUTTON_REGRESSION_P3_52_CI_WORKFLOW,
  BUTTON_REGRESSION_P3_52_CRITICAL_PAGE_COUNT,
  BUTTON_REGRESSION_P3_52_DOC,
  BUTTON_REGRESSION_P3_52_FLOW_STEPS,
  BUTTON_REGRESSION_P3_52_NPM_SCRIPT,
  BUTTON_REGRESSION_P3_52_POLICY_ID,
  BUTTON_REGRESSION_P3_52_SPEC,
  BUTTON_REGRESSION_P3_52_UNIT_TEST,
  buttonRegressionCriticalPageIds,
  hasButtonRegressionP3_52Credentials,
  isButtonRegressionP3_52Enabled,
} from "@/lib/qa/button-regression-p3-52-policy";

const ROOT = process.cwd();

describe("Button regression (P3-52)", () => {
  it("locks policy id and thirty-page matrix", () => {
    expect(BUTTON_REGRESSION_P3_52_POLICY_ID).toBe("button-regression-p3-52-v1");
    expect(buttonRegressionCriticalPageIds()).toHaveLength(BUTTON_REGRESSION_P3_52_CRITICAL_PAGE_COUNT);
    expect(BUTTON_REGRESSION_P3_52_FLOW_STEPS).toEqual([
      "validate_button_regression_contract",
      "authed_page_button_smoke",
    ]);
    expect(BUTTON_REGRESSION_P3_52_SHELL_BUTTONS).toHaveLength(3);
  });

  it("validates button regression contract", () => {
    const validation = validateButtonRegressionContract();
    expect(validation.passed).toBe(true);
    expect(validation.pageCount).toBe(30);
    expect(validation.probeCount).toBeGreaterThanOrEqual(90);
    expect(buildButtonRegressionPageProbes()).toHaveLength(30);
    expect(countButtonRegressionProbes()).toBeGreaterThanOrEqual(90);
  });

  it("passes full button regression audit", () => {
    const summary = auditButtonRegressionP3_52(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.specWired).toBe(true);
    expect(summary.flowWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.thirtyPagesPresent).toBe(true);
    expect(summary.probeCount).toBeGreaterThanOrEqual(90);
    expect(summary.passed).toBe(true);
    expect(formatButtonRegressionP3_52AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, BUTTON_REGRESSION_P3_52_DOC))).toBe(true);
    expect(existsSync(join(ROOT, BUTTON_REGRESSION_P3_52_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, BUTTON_REGRESSION_P3_52_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, BUTTON_REGRESSION_P3_52_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[BUTTON_REGRESSION_P3_52_NPM_SCRIPT]).toContain(
      "audit-button-regression-p3-52.ts",
    );
    expect(pkg.scripts?.[BUTTON_REGRESSION_P3_52_CHECK_NPM_SCRIPT]).toContain(
      BUTTON_REGRESSION_P3_52_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, BUTTON_REGRESSION_P3_52_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("button-regression-p3-52");
  });

  it("E2E gate requires E2E_BUTTON_REGRESSION_P3_52 flag", () => {
    const original = process.env.E2E_BUTTON_REGRESSION_P3_52;
    delete process.env.E2E_BUTTON_REGRESSION_P3_52;
    expect(isButtonRegressionP3_52Enabled()).toBe(false);
    process.env.E2E_BUTTON_REGRESSION_P3_52 = "true";
    expect(isButtonRegressionP3_52Enabled()).toBe(true);
    if (original !== undefined) process.env.E2E_BUTTON_REGRESSION_P3_52 = original;
    else delete process.env.E2E_BUTTON_REGRESSION_P3_52;
  });

  it("owner credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasButtonRegressionP3_52Credentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});

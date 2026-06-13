import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditNegativeTestSuiteP3_54,
  formatNegativeTestSuiteP3_54AuditLines,
} from "@/lib/qa/negative-test-suite-p3-54-audit";
import {
  buildNegativeTestSuiteModuleStatuses,
  uniqueNegativeTestSuiteSpecs,
  validateNegativeTestSuiteContract,
} from "@/lib/qa/negative-test-suite-p3-54-measurement";
import {
  NEGATIVE_TEST_SUITE_P3_54_AUDIT_SCRIPT,
  NEGATIVE_TEST_SUITE_P3_54_CHECK_NPM_SCRIPT,
  NEGATIVE_TEST_SUITE_P3_54_CI_WORKFLOW,
  NEGATIVE_TEST_SUITE_P3_54_DOC,
  NEGATIVE_TEST_SUITE_P3_54_E2E_NPM_SCRIPT,
  NEGATIVE_TEST_SUITE_P3_54_FLOW_STEPS,
  NEGATIVE_TEST_SUITE_P3_54_MODULE_COUNT,
  NEGATIVE_TEST_SUITE_P3_54_NPM_SCRIPT,
  NEGATIVE_TEST_SUITE_P3_54_POLICY_ID,
  NEGATIVE_TEST_SUITE_P3_54_SPEC,
  NEGATIVE_TEST_SUITE_P3_54_UNIT_TEST,
  isNegativeTestSuiteP3_54Enabled,
  negativeTestSuiteModuleIds,
} from "@/lib/qa/negative-test-suite-p3-54-policy";

const ROOT = process.cwd();

describe("Negative test suite (P3-54)", () => {
  it("locks policy id and five-module negative matrix", () => {
    expect(NEGATIVE_TEST_SUITE_P3_54_POLICY_ID).toBe("negative-test-suite-p3-54-v1");
    expect(negativeTestSuiteModuleIds()).toHaveLength(NEGATIVE_TEST_SUITE_P3_54_MODULE_COUNT);
    expect(NEGATIVE_TEST_SUITE_P3_54_FLOW_STEPS).toHaveLength(6);
    expect(negativeTestSuiteModuleIds()).toEqual([
      "invalid_signature",
      "replay_webhook",
      "wrong_tenant",
      "expired_session",
      "no_permission",
    ]);
  });

  it("validates negative suite contract", () => {
    const validation = validateNegativeTestSuiteContract(ROOT);
    expect(validation.passed).toBe(true);
    expect(validation.moduleCount).toBe(5);
    expect(validation.specCount).toBeGreaterThanOrEqual(5);
    expect(buildNegativeTestSuiteModuleStatuses(ROOT).every((status) => status.specPresent)).toBe(
      true,
    );
    expect(uniqueNegativeTestSuiteSpecs().length).toBeGreaterThanOrEqual(5);
  });

  it("passes full negative test suite audit", () => {
    const summary = auditNegativeTestSuiteP3_54(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.specWired).toBe(true);
    expect(summary.flowWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.fiveModulesPresent).toBe(true);
    expect(summary.expiredSessionWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatNegativeTestSuiteP3_54AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, NEGATIVE_TEST_SUITE_P3_54_DOC))).toBe(true);
    expect(existsSync(join(ROOT, NEGATIVE_TEST_SUITE_P3_54_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, NEGATIVE_TEST_SUITE_P3_54_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, NEGATIVE_TEST_SUITE_P3_54_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[NEGATIVE_TEST_SUITE_P3_54_NPM_SCRIPT]).toContain(
      "audit-negative-test-suite-p3-54.ts",
    );
    expect(pkg.scripts?.[NEGATIVE_TEST_SUITE_P3_54_CHECK_NPM_SCRIPT]).toContain(
      NEGATIVE_TEST_SUITE_P3_54_UNIT_TEST,
    );
    expect(pkg.scripts?.[NEGATIVE_TEST_SUITE_P3_54_E2E_NPM_SCRIPT]).toContain(
      "negative-test-suite-p3-54",
    );

    const workflow = readFileSync(join(ROOT, NEGATIVE_TEST_SUITE_P3_54_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("negative-test-suite-p3-54");
  });

  it("E2E gate requires E2E_NEGATIVE_TEST_SUITE flag", () => {
    const original = process.env.E2E_NEGATIVE_TEST_SUITE;
    delete process.env.E2E_NEGATIVE_TEST_SUITE;
    expect(isNegativeTestSuiteP3_54Enabled()).toBe(false);
    process.env.E2E_NEGATIVE_TEST_SUITE = "true";
    expect(isNegativeTestSuiteP3_54Enabled()).toBe(true);
    if (original !== undefined) process.env.E2E_NEGATIVE_TEST_SUITE = original;
    else delete process.env.E2E_NEGATIVE_TEST_SUITE;
  });
});

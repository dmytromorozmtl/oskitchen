import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditBundleBudgetGateP3_59,
  formatBundleBudgetGateP3_59AuditLines,
} from "@/lib/qa/bundle-budget-gate-p3-59-audit";
import {
  simulateBundleBudgetGateFromLog,
  validateBundleBudgetGateContract,
} from "@/lib/qa/bundle-budget-gate-p3-59-measurement";
import {
  BUNDLE_BUDGET_GATE_P3_59_AUDIT_SCRIPT,
  BUNDLE_BUDGET_GATE_P3_59_CHECK_NPM_SCRIPT,
  BUNDLE_BUDGET_GATE_P3_59_DOC,
  BUNDLE_BUDGET_GATE_P3_59_FAIL_KB,
  BUNDLE_BUDGET_GATE_P3_59_NPM_SCRIPT,
  BUNDLE_BUDGET_GATE_P3_59_NPM_SCRIPTS,
  BUNDLE_BUDGET_GATE_P3_59_POLICY_ID,
  BUNDLE_BUDGET_GATE_P3_59_UNIT_TEST,
  BUNDLE_BUDGET_GATE_P3_59_WARN_KB,
  isBundleBudgetGateP3_59Enabled,
} from "@/lib/qa/bundle-budget-gate-p3-59-policy";

const ROOT = process.cwd();

describe("Bundle budget gate (P3-59)", () => {
  it("locks policy id and 1000 kB fail threshold", () => {
    expect(BUNDLE_BUDGET_GATE_P3_59_POLICY_ID).toBe("bundle-budget-gate-p3-59-v1");
    expect(BUNDLE_BUDGET_GATE_P3_59_WARN_KB).toBe(500);
    expect(BUNDLE_BUDGET_GATE_P3_59_FAIL_KB).toBe(1000);
  });

  it("validates bundle budget gate contract", () => {
    const validation = validateBundleBudgetGateContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.failThresholdKb).toBe(1000);
    expect(validation.ciWorkflowWired).toBe(true);
  });

  it("simulates fail gate for routes over 1000 kB", () => {
    const failLog = `
├ ƒ /dashboard/too-heavy                   1 kB         1.1 MB
+ First Load JS shared by all              102 kB
`;
    const result = simulateBundleBudgetGateFromLog(failLog);
    expect(result.failCount).toBe(1);
    expect(result.routesOverFailKb).toContain("/dashboard/too-heavy");
  });

  it("passes full bundle budget gate audit", () => {
    const summary = auditBundleBudgetGateP3_59(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.specWired).toBe(true);
    expect(summary.flowWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.failGate1000Kb).toBe(true);
    expect(summary.ciWorkflowWired).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatBundleBudgetGateP3_59AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, BUNDLE_BUDGET_GATE_P3_59_DOC))).toBe(true);
    expect(existsSync(join(ROOT, BUNDLE_BUDGET_GATE_P3_59_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, BUNDLE_BUDGET_GATE_P3_59_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[BUNDLE_BUDGET_GATE_P3_59_NPM_SCRIPT]).toContain(
      "audit-bundle-budget-gate-p3-59.ts",
    );
    expect(pkg.scripts?.[BUNDLE_BUDGET_GATE_P3_59_CHECK_NPM_SCRIPT]).toContain(
      BUNDLE_BUDGET_GATE_P3_59_UNIT_TEST,
    );
    for (const script of BUNDLE_BUDGET_GATE_P3_59_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });

  it("E2E gate requires E2E_BUNDLE_BUDGET_GATE flag", () => {
    const original = process.env.E2E_BUNDLE_BUDGET_GATE;
    delete process.env.E2E_BUNDLE_BUDGET_GATE;
    expect(isBundleBudgetGateP3_59Enabled()).toBe(false);
    process.env.E2E_BUNDLE_BUDGET_GATE = "true";
    expect(isBundleBudgetGateP3_59Enabled()).toBe(true);
    if (original !== undefined) process.env.E2E_BUNDLE_BUDGET_GATE = original;
    else delete process.env.E2E_BUNDLE_BUDGET_GATE;
  });
});
